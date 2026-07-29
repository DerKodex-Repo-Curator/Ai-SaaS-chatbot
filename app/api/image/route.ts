import { NextResponse } from "next/server";

const COMFYUI_API_URL =
  process.env.COMFYUI_API_URL ??
  process.env.LOCAL_IMAGE_API_URL ??
  "http://127.0.0.1:8188";
const COMFYUI_CHECKPOINT =
  process.env.COMFYUI_CHECKPOINT ?? "v1-5-pruned-emaonly.1.safetensors";
const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 12 * 60 * 1000;

type ComfyPromptResponse = {
  prompt_id?: string;
  error?: {
    message?: string;
  };
};

type ComfyImageOutput = {
  filename: string;
  subfolder?: string;
  type?: string;
};

type ComfyHistoryResponse = Record<
  string,
  {
    outputs?: Record<
      string,
      {
        images?: ComfyImageOutput[];
      }
    >;
    status?: {
      completed?: boolean;
      status_str?: string;
    };
  }
>;

const sleep = (duration: number) =>
  new Promise((resolve) => setTimeout(resolve, duration));

const createWorkflow = (prompt: string) => ({
  "3": {
    class_type: "KSampler",
    inputs: {
      seed: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER),
      steps: 12,
      cfg: 7,
      sampler_name: "euler",
      scheduler: "normal",
      denoise: 1,
      model: ["4", 0],
      positive: ["6", 0],
      negative: ["7", 0],
      latent_image: ["5", 0],
    },
  },
  "4": {
    class_type: "CheckpointLoaderSimple",
    inputs: {
      ckpt_name: COMFYUI_CHECKPOINT,
    },
  },
  "5": {
    class_type: "EmptyLatentImage",
    inputs: {
      width: 512,
      height: 512,
      batch_size: 1,
    },
  },
  "6": {
    class_type: "CLIPTextEncode",
    inputs: {
      text: prompt,
      clip: ["4", 1],
    },
  },
  "7": {
    class_type: "CLIPTextEncode",
    inputs: {
      text: "blurry, low quality, distorted, deformed, watermark, text",
      clip: ["4", 1],
    },
  },
  "8": {
    class_type: "VAEDecode",
    inputs: {
      samples: ["3", 0],
      vae: ["4", 2],
    },
  },
  "9": {
    class_type: "SaveImage",
    inputs: {
      filename_prefix: "genius-ai",
      images: ["8", 0],
    },
  },
});

const getGeneratedImage = (history: ComfyHistoryResponse, promptId: string) => {
  const outputs = history[promptId]?.outputs;

  if (!outputs) {
    return null;
  }

  for (const output of Object.values(outputs)) {
    const image = output.images?.[0];

    if (image) {
      return image;
    }
  }

  return null;
};

const waitForImage = async (promptId: string) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < POLL_TIMEOUT_MS) {
    const response = await fetch(`${COMFYUI_API_URL}/history/${promptId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`ComfyUI history failed with status ${response.status}`);
    }

    const history = (await response.json()) as ComfyHistoryResponse;
    const image = getGeneratedImage(history, promptId);

    if (image) {
      return image;
    }

    const status = history[promptId]?.status;

    if (status?.completed === false && status.status_str === "error") {
      throw new Error("ComfyUI failed while generating the image");
    }

    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("ComfyUI image generation timed out");
};

const fetchImageDataUrl = async (image: ComfyImageOutput) => {
  const params = new URLSearchParams({
    filename: image.filename,
    subfolder: image.subfolder ?? "",
    type: image.type ?? "output",
  });

  const response = await fetch(`${COMFYUI_API_URL}/view?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`ComfyUI image fetch failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") ?? "image/png";
  const imageBuffer = Buffer.from(await response.arrayBuffer());

  return `data:${contentType};base64,${imageBuffer.toString("base64")}`;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return new NextResponse("Image prompt is required", { status: 400 });
    }

    const response = await fetch(`${COMFYUI_API_URL}/prompt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: createWorkflow(prompt),
      }),
    });

    const data = (await response.json()) as ComfyPromptResponse;

    if (!response.ok || !data.prompt_id) {
      return new NextResponse(
        data.error?.message ||
          `ComfyUI prompt request failed with status ${response.status}`,
        { status: 502 },
      );
    }

    const image = await waitForImage(data.prompt_id);
    const imageUrl = await fetchImageDataUrl(image);

    return NextResponse.json({
      imageUrl,
    });
  } catch (error) {
    console.error("COMFYUI IMAGE GENERATION ERROR:", error);

    if (error instanceof TypeError) {
      return new NextResponse(
        `Could not reach ComfyUI at ${COMFYUI_API_URL}. Start ComfyUI on port 8188 and try again.`,
        { status: 502 },
      );
    }

    return new NextResponse(
      error instanceof Error
        ? error.message
        : "Failed to generate image with ComfyUI",
      { status: 500 },
    );
  }
}
