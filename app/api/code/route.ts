import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

type CodeMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";
const SYSTEM_PROMPT = `
You are an expert coding assistant inside a web app. Help with programming tasks clearly, accurately, and practically.

RESPONSE STYLE:
- Be direct and useful.
- When code is requested, prefer complete working snippets.
- Use markdown only when it improves readability.
- Put code inside fenced code blocks and include a language tag when you can.
- Keep explanations concise unless the user asks for more detail.
- Maintain context from earlier in the coding conversation.
- If the user shares buggy code, explain the issue and then show a corrected version.
- If there are tradeoffs, say which option you recommend and why.
`.trim();

const isCodeMessageArray = (value: unknown): value is CodeMessage[] => {
  return (
    Array.isArray(value) &&
    value.every((message) => {
      if (!message || typeof message !== "object") {
        return false;
      }

      const { role, content } = message as {
        role?: unknown;
        content?: unknown;
      };

      return typeof role === "string" && typeof content === "string";
    })
  );
};

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    const body = await req.json();
    const { messages } = body;

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!isCodeMessageArray(messages) || messages.length === 0) {
      return new NextResponse("Invalid messages", { status: 400 });
    }

    const codeMessages =
      messages[0]?.role === "system"
        ? messages
        : [{ role: "system", content: SYSTEM_PROMPT }, ...messages];

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages: codeMessages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OLLAMA ERROR:", errorText);
      return new NextResponse("Failed to get a response from Ollama", {
        status: 502,
      });
    }

    const data = (await response.json()) as {
      message?: CodeMessage;
    };

    if (!data.message) {
      return new NextResponse("Invalid Ollama response", { status: 502 });
    }

    return NextResponse.json(data.message);
  } catch (error) {
    console.log("ERROR:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
