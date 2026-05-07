import { NextResponse } from "next/server";

const LOCAL_IMAGE_API_URL =
  process.env.LOCAL_IMAGE_API_URL ?? "http://127.0.0.1:7860";

type StableDiffusionTxt2ImgResponse = {
  images?: string[];
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof TypeError) {
    return `Local image generator is not reachable at ${LOCAL_IMAGE_API_URL}. Start Stable Diffusion WebUI with API mode enabled, then try again.`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Failed to generate image with the local image backend.";
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt =
      typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return new NextResponse("Image prompt is required", { status: 400 });
    }

    const response = await fetch(`${LOCAL_IMAGE_API_URL}/sdapi/v1/txt2img`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        negative_prompt:
          "blurry, low quality, distorted, deformed, watermark, text",
        steps: 24,
        cfg_scale: 7,
        width: 768,
        height: 768,
        sampler_name: "DPM++ 2M Karras",
        batch_size: 1,
        n_iter: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      return new NextResponse(
        errorText ||
          `Local image generator failed with status ${response.status}`,
        { status: 502 },
      );
    }

    const data = (await response.json()) as StableDiffusionTxt2ImgResponse;
    const imageBase64 = data.images?.[0];

    if (!imageBase64) {
      return new NextResponse("Local image generator returned no image", {
        status: 502,
      });
    }

    return NextResponse.json({
      imageUrl: `data:image/png;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error("LOCAL IMAGE GENERATION ERROR:", error);

    return new NextResponse(getErrorMessage(error), { status: 500 });
  }
}
