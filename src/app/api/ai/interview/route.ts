import { NextRequest, NextResponse } from "next/server";
import { conductInterviewStep, evaluateInterviewSession, InterviewRoundData } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, programName, previousRounds, currentAnswer, allRounds } = body;

    if (!programName) {
      return NextResponse.json({ error: "Program name is required" }, { status: 400 });
    }

    if (action === "evaluate") {
      const evaluation = await evaluateInterviewSession(
        programName,
        (allRounds || []) as InterviewRoundData[]
      );
      return NextResponse.json(evaluation);
    }

    // Default: action === "step"
    const stepResult = await conductInterviewStep(
      programName,
      (previousRounds || []) as InterviewRoundData[],
      currentAnswer
    );

    return NextResponse.json(stepResult);
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Failed to process interview step" },
      { status: 500 }
    );
  }
}
