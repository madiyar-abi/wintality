import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import { expandedOpportunities } from "../src/config/expandedOpportunities";

// Simple env loader without external dependencies
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const idx = trimmed.indexOf("=");
          if (idx !== -1) {
            const key = trimmed.slice(0, idx).trim();
            const val = trimmed.slice(idx + 1).trim();
            process.env[key] = val;
          }
        }
      });
    }
  } catch {
    // Ignore error
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cfxuwtftetexhhjozltw.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!serviceRoleKey) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

function mapCategory(cat: string): string {
  if (cat === "summer_school") return "summer_program";
  if (cat === "scholarship") return "grant";
  if (cat === "internship") return "internship";
  if (cat === "mun") return "mun";
  return "olympiad";
}

export const seedOpportunities = expandedOpportunities.map((opp, idx) => {
  const uuid = `e1000000-0000-0000-0000-${String(idx + 1).padStart(12, "0")}`;
  const deadlineDate = new Date(Date.now() + (opp.daysLeft || 30) * 24 * 3600 * 1000).toISOString();

  return {
    id: uuid,
    title: {
      ru: opp.title,
      kz: opp.titleKz || opp.title,
      en: opp.titleEn || opp.title
    },
    organization: opp.organizer,
    description: {
      ru: opp.description,
      kz: opp.description,
      en: opp.description
    },
    category: mapCategory(opp.category),
    region: opp.scope === "kazakhstan" ? "kz" : "international",
    city: opp.cityBadge,
    deadline: deadlineDate,
    target_grades: [opp.gradeMin, opp.gradeMax],
    tags: opp.tags,
    requirements: {
      ru: opp.requirements,
      kz: opp.requirements,
      en: opp.requirements
    },
    link: opp.link,
    is_featured: opp.isFeatured,
    interested_count: 200 + ((idx * 37) % 550),
    views_count: 1500 + ((idx * 143) % 4000)
  };
});

export async function seedDatabase() {
  console.log(`Seeding ${seedOpportunities.length} verified opportunities into Supabase...`);
  let successCount = 0;
  for (const item of seedOpportunities) {
    const { error } = await supabase.from("opportunities").upsert(item, { onConflict: "id" });
    if (error) {
      console.warn(`Error seeding opportunity ${item.id}:`, error.message);
    } else {
      successCount++;
    }
  }
  console.log(`Seeding complete! Successfully synced ${successCount}/${seedOpportunities.length} opportunities.`);
}

if (require.main === module) {
  seedDatabase().catch(console.error);
}
