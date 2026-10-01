import { NextResponse } from "next/server";
import { improveResumeBullet } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bulletText, context } = body;

    if (!bulletText || typeof bulletText !== "string" || bulletText.trim().length === 0) {
      return NextResponse.json(
        { error: "Пожалуйста, укажите текст пункта резюме для улучшения." },
        { status: 400 }
      );
    }

    const result = await improveResumeBullet(bulletText.trim(), context);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
