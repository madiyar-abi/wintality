import { describe, it, expect } from "vitest";
import { allOpportunities } from "@/config/site";

describe("Opportunities Catalog & Deadline Logic", () => {
  it("should have over 100 verified opportunities in catalog", () => {
    expect(allOpportunities.length).toBeGreaterThanOrEqual(100);
  });

  it("should have at least 50 Kazakhstan opportunities and 50 Global opportunities", () => {
    const kzCount = allOpportunities.filter((o) => o.scope === "kazakhstan").length;
    const globalCount = allOpportunities.filter((o) => o.scope === "international").length;

    expect(kzCount).toBeGreaterThanOrEqual(50);
    expect(globalCount).toBeGreaterThanOrEqual(50);
  });

  it("should calculate positive daysLeft for each opportunity", () => {
    allOpportunities.forEach((opp) => {
      expect(opp.daysLeft).toBeGreaterThan(0);
      expect(opp.title).toBeTruthy();
      expect(opp.organizer).toBeTruthy();
      expect(opp.link).toMatch(/^https?:\/\//);
    });
  });

  it("should have valid grade ranges for all opportunities", () => {
    allOpportunities.forEach((opp) => {
      expect(opp.gradeMin).toBeGreaterThanOrEqual(7);
      expect(opp.gradeMax).toBeLessThanOrEqual(12);
      expect(opp.gradeMin).toBeLessThanOrEqual(opp.gradeMax);
    });
  });
});
