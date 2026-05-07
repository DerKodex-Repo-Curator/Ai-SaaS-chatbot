import { NextResponse } from "next/server";

type ConversationMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL ?? "qwen2.5:3b";
const SYSTEM_PROMPT = `
You are a helpful chat assistant inside a web app. Answer questions clearly, naturally, and conversationally.

CRITICAL FORMATTING RULES — follow these without exception:
- Write in plain text only. No exceptions.
- Never use markdown: no **bold**, no *italic*, no # headings, no bullet points (- or *), no numbered lists, no tables, no backticks, no blockquotes.
- Never use LaTeX or math notation: no \( \), no \[ \], no \frac{}{}, no ^ for superscripts.
- Write all math in plain English. Example: radius = diameter / 2. Not fractions, not symbols.
- If you feel tempted to use a list, write it as a sentence instead. Example: "You can do this by first doing X, then Y, then Z."
- If you feel tempted to use bold for emphasis, just write the sentence clearly without it.

RESPONSE STYLE:
- Be direct. Give the answer first, then explain if needed.
- Match the user's tone — casual if they're casual, detailed if they ask for depth.
- Keep responses short by default. Add detail only when the user asks.
- Never add unnecessary disclaimers or filler phrases.
- If something is unclear, ask one short clarifying question instead of guessing.
- Never make up facts. If unsure, say so and give your best honest answer.
- Maintain context from earlier in the conversation.

When the user asks for code, provide clean working code with a brief plain-text explanation.
When the user asks for writing help, give polished natural wording.
`.trim();

const isConversationMessageArray = (
  value: unknown,
): value is ConversationMessage[] => {
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
    const body = await req.json();
    const { messages } = body;

    if (!isConversationMessageArray(messages) || messages.length === 0) {
      return new NextResponse("Invalid messages", { status: 400 });
    }

    const conversationMessages =
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
        messages: conversationMessages,
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
      message?: ConversationMessage;
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
