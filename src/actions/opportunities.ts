"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { allOpportunities } from "@/config/site";
import { Opportunity } from "@/types";

export type ApplicationStatus =
  | "saved"
  | "in_progress"
  | "submitted"
  | "accepted"
  | "rejected"
  | "interested"
  | "preparing"
  | "applied"
  | "result_received";

export interface TrackedOpportunityItem {
  id: string;
  opportunityId: string;
  status: ApplicationStatus;
  isFavorite: boolean;
  personalNotes?: string;
  deadlineReminder: boolean;
  updatedAt: string;
  opportunity: Opportunity;
}

interface DemoTrackedRecord {
  status: ApplicationStatus;
  notes?: string;
  updatedAt: string;
}

// Fallback demo state in cookie if user is in local demo session
async function getDemoTrackedMap(): Promise<Record<string, DemoTrackedRecord>> {
  const cookieStore = await cookies();
  const raw = cookieStore.get("wintality_demo_tracked")?.value;
  if (!raw) {
    return {
      "nu-summer-research": {
        status: "preparing",
        notes: "Запросить транскрипт в школе и подготовить черновик эссе",
        updatedAt: new Date().toISOString()
      },
      "daryn-republican": {
        status: "preparing",
        notes: "Школьный этап пройден, готовиться к району",
        updatedAt: new Date().toISOString()
      },
      "wharton-investment-comp": {
        status: "interested",
        notes: "Собрать команду из 4 человек",
        updatedAt: new Date().toISOString()
      },
      "flex-scholarship": {
        status: "applied",
        notes: "Анкета и 3 эссе отправлены!",
        updatedAt: new Date().toISOString()
      }
    };
  }
  try {
    return JSON.parse(raw) as Record<string, DemoTrackedRecord>;
  } catch {
    return {};
  }
}

async function saveDemoTrackedMap(map: Record<string, DemoTrackedRecord>) {
  const cookieStore = await cookies();
  cookieStore.set("wintality_demo_tracked", JSON.stringify(map), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

/**
 * 1. toggleTrackOpportunity: Add or remove opportunity from user's tracker
 */
export async function toggleTrackOpportunity(
  opportunityId: string,
  targetStatus: ApplicationStatus = "interested"
): Promise<{
  success: boolean;
  action?: "added" | "removed";
  opportunityId?: string;
  status?: ApplicationStatus;
  error?: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("wintality_demo_session")?.value === "true";

  if (!user && !hasDemo) {
    // Also allow guest preview tracking via demo map
    const demoMap = await getDemoTrackedMap();
    if (demoMap[opportunityId]) {
      delete demoMap[opportunityId];
      await saveDemoTrackedMap(demoMap);
      revalidatePath("/dashboard");
      revalidatePath("/opportunities");
      return { success: true, action: "removed", opportunityId };
    } else {
      demoMap[opportunityId] = {
        status: targetStatus,
        updatedAt: new Date().toISOString()
      };
      await saveDemoTrackedMap(demoMap);
      revalidatePath("/dashboard");
      revalidatePath("/opportunities");
      return { success: true, action: "added", opportunityId, status: targetStatus };
    }
  }

  // Real Supabase Auth Flow
  if (user) {
    try {
      const { data: existing } = await supabase
        .from("user_opportunities")
        .select("id, status")
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId)
        .maybeSingle();

      if (existing) {
        // Toggle: delete from tracker
        await supabase
          .from("user_opportunities")
          .delete()
          .eq("id", existing.id);

        revalidatePath("/dashboard");
        revalidatePath("/opportunities");
        return { success: true, action: "removed", opportunityId };
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from("user_opportunities")
          .insert({
            user_id: user.id,
            opportunity_id: opportunityId,
            status: targetStatus,
          });

        if (insertError) {
          console.warn("Supabase insert user_opportunities note:", insertError.message);
        }

        revalidatePath("/dashboard");
        revalidatePath("/opportunities");
        return { success: true, action: "added", opportunityId, status: targetStatus };
      }
    } catch (err) {
      console.warn("Supabase query error, fallback to cookie tracker:", err);
    }
  }

  // Demo / fallback mode
  const demoMap = await getDemoTrackedMap();
  if (demoMap[opportunityId]) {
    delete demoMap[opportunityId];
    await saveDemoTrackedMap(demoMap);
    revalidatePath("/dashboard");
    revalidatePath("/opportunities");
    return { success: true, action: "removed", opportunityId };
  } else {
    demoMap[opportunityId] = {
      status: targetStatus,
      updatedAt: new Date().toISOString()
    };
    await saveDemoTrackedMap(demoMap);
    revalidatePath("/dashboard");
    revalidatePath("/opportunities");
    return { success: true, action: "added", opportunityId, status: targetStatus };
  }
}

/**
 * 2. updateApplicationStatus: Change status ('interested' -> 'preparing' -> 'applied' -> 'result_received') & personal notes
 */
export async function updateApplicationStatus(
  opportunityId: string,
  status: ApplicationStatus,
  notes?: string
): Promise<{ success: boolean; status: ApplicationStatus; notes?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    try {
      const updateData: {
        status: ApplicationStatus;
        updated_at: string;
        notes?: string;
        personal_notes?: string;
      } = {
        status,
        updated_at: new Date().toISOString()
      };
      if (typeof notes === "string") {
        updateData.notes = notes;
        updateData.personal_notes = notes;
      }

      const { error } = await supabase
        .from("user_opportunities")
        .update(updateData)
        .eq("user_id", user.id)
        .eq("opportunity_id", opportunityId);

      if (!error) {
        revalidatePath("/dashboard");
        return { success: true, status, notes };
      }
    } catch (err) {
      console.warn("Supabase update user_opportunities note:", err);
    }
  }

  // Demo Cookie Update
  const demoMap = await getDemoTrackedMap();
  if (demoMap[opportunityId]) {
    demoMap[opportunityId].status = status;
    if (typeof notes === "string") {
      demoMap[opportunityId].notes = notes;
    }
    demoMap[opportunityId].updatedAt = new Date().toISOString();
    await saveDemoTrackedMap(demoMap);
  } else {
    demoMap[opportunityId] = {
      status,
      notes,
      updatedAt: new Date().toISOString()
    };
    await saveDemoTrackedMap(demoMap);
  }

  revalidatePath("/dashboard");
  return { success: true, status, notes };
}

/**
 * 3. incrementOpportunityView: Safe view increment
 */
export async function incrementOpportunityView(opportunityId: string): Promise<void> {
  try {
    const supabase = await createClient();
    await supabase.rpc("increment_opportunity_views", { opp_id: opportunityId });
  } catch {
    // Non-critical, ignore error
  }
}

/**
 * 4. getUserTrackedOpportunities: Retrieve full tracked opportunities for dashboard
 */
export async function getUserTrackedOpportunities(): Promise<TrackedOpportunityItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let trackedMap: Record<string, DemoTrackedRecord> = {};

  if (user) {
    try {
      const { data: dbTracked } = await supabase
        .from("user_opportunities")
        .select("opportunity_id, status, notes, personal_notes, updated_at")
        .eq("user_id", user.id);

      if (dbTracked && dbTracked.length > 0) {
        dbTracked.forEach((row: {
          opportunity_id: string;
          status: string;
          notes?: string;
          personal_notes?: string;
          updated_at: string;
        }) => {
          trackedMap[row.opportunity_id] = {
            status: row.status as ApplicationStatus,
            notes: row.notes || row.personal_notes,
            updatedAt: row.updated_at
          };
        });
      }
    } catch (err) {
      console.warn("Supabase read user_opportunities note:", err);
    }
  }

  // Combine with demo map if empty
  if (Object.keys(trackedMap).length === 0) {
    trackedMap = await getDemoTrackedMap();
  }

  const result: TrackedOpportunityItem[] = [];

  for (const [oppId, state] of Object.entries(trackedMap)) {
    const opp = allOpportunities.find((o) => o.id === oppId);
    if (!opp) continue;

    result.push({
      id: oppId,
      opportunityId: oppId,
      status: state.status,
      isFavorite: true,
      personalNotes: state.notes,
      deadlineReminder: true,
      updatedAt: state.updatedAt,
      opportunity: opp
    });
  }

  return result.sort((a, b) => a.opportunity.daysLeft - b.opportunity.daysLeft);
}
