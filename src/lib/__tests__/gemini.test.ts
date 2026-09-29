import { describe, it, expect } from "vitest";
import { calculateMatch, reviewEssay, generatePersonalRoadmap } from "../ai/gemini";

describe("Gemini AI Core Services", () => {
  it("should calculate match score and return valid structure", async () => {
    const profile = {
      grade: "10 класс",
      englishLevel: "B2",
      interests: ["STEM", "AI", "Olympiads"]
    };

    const opportunity = {
      title: "Nazarbayev University Pre-College Summer Research",
      organizer: "Nazarbayev University",
      gradeMin: 10,
      gradeMax: 11,
      englishRequired: "B2"
    };

    const result = await calculateMatch(profile, opportunity);

    expect(result).toBeDefined();
    expect(result.matchScore).toBeGreaterThanOrEqual(0);
    expect(result.matchScore).toBeLessThanOrEqual(100);
    expect(Array.isArray(result.strengths)).toBe(true);
    expect(Array.isArray(result.gaps)).toBe(true);
    expect(Array.isArray(result.deadlineStrategy)).toBe(true);
    expect(typeof result.verdict).toBe("string");
  });

  it("should review essay and return structured feedback with score", async () => {
    const essay = "I have always dreamed of studying artificial intelligence at Nazarbayev University to solve real educational challenges in Kazakhstan.";
    const result = await reviewEssay(essay, "Nazarbayev University", "en");

    expect(result).toBeDefined();
    expect(result.aiScore).toBeGreaterThanOrEqual(1);
    expect(result.aiScore).toBeLessThanOrEqual(10);
    expect(result.structureFeedback).toBeTruthy();
    expect(result.toneAndStyle).toBeTruthy();
  });

  it("should generate a personalized academic roadmap", async () => {
    const profile = {
      grade: "10 класс",
      targetMajor: "Computer Science",
      city: "Алматы"
    };

    const roadmap = await generatePersonalRoadmap(profile);

    expect(roadmap).toBeDefined();
    expect(roadmap.targetGoal).toBeTruthy();
    expect(roadmap.executiveSummary).toBeTruthy();
    expect(Array.isArray(roadmap.quarters)).toBe(true);
    expect(roadmap.quarters.length).toBeGreaterThan(0);
  });
});
