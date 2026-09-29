import { NextResponse } from "next/server";
import { reviewMotivationLetter } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { essayText, targetGoal, language } = body;

    if (!essayText || essayText.trim().length < 20) {
      return NextResponse.json(
        { error: "Пожалуйста, введите текст эссе (минимум 20 символов)." },
        { status: 400 }
      );
    }

    const review = await reviewMotivationLetter(
      essayText,
      targetGoal || "Поступление в Nazarbayev University / Грантовая программа",
      language || "ru"
    );

    return NextResponse.json(review);
  } catch (error: any) {
    console.error("AI Essay Review API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
