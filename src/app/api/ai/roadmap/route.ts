import { NextResponse } from "next/server";
import { generatePersonalRoadmap } from "@/lib/ai/gemini";
import { getCurrentUser } from "@/app/actions/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetGoal, grade, interests } = body;

    const user = await getCurrentUser();
    const effectiveGrade = grade || user?.grade || "10 класс";
    const effectiveGoal = targetGoal || "Поступление в Nazarbayev University на грант";
    const effectiveInterests = interests || ["Computer Science", "Business & Economics"];

    const roadmap = await generatePersonalRoadmap({
      targetMajor: effectiveGoal,
      grade: effectiveGrade,
      interests: effectiveInterests
    });

    // Provide both milestones and quarters for frontend compatibility
    return NextResponse.json({
      goalTitle: roadmap.targetGoal,
      strategySummary: roadmap.executiveSummary,
      milestones: roadmap.quarters.map((q) => ({
        month: q.period,
        title: q.focus,
        priority: q.priority,
        tasks: q.actionItems,
        recommendedPrograms: q.targetPrograms
      })),
      successMetrics: roadmap.targetMilestones
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
