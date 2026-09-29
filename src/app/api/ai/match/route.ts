import { NextResponse } from "next/server";
import { calculateMatch } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/app/actions/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { opportunity, profileOverride } = body;

    if (!opportunity || !opportunity.title) {
      return NextResponse.json({ error: "Missing opportunity data" }, { status: 400 });
    }

    const user = await getCurrentUser();
    const studentProfile = profileOverride || {
      fullName: user?.fullName || "Ameli",
      grade: user?.grade || "10 класс",
      englishLevel: "B2",
      interests: ["Business & Economics", "Computer Science", "FinTech"],
      city: "Алматы",
      bio: "Старшеклассник, стремящийся к победе на олимпиадах и поступлению в топ-вузы"
    };

    const analysis = await calculateMatch(studentProfile, opportunity);
    return NextResponse.json(analysis);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
