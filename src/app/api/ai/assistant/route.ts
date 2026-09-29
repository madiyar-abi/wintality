import { NextResponse } from "next/server";
import { askAIAssistant } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, context } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json(
        { error: "Пожалуйста, введите ваш вопрос." },
        { status: 400 }
      );
    }

    const response = await askAIAssistant(message.trim(), context);
    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
