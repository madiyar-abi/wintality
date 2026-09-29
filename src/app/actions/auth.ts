"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface CurrentUserData {
  id: string;
  email?: string;
  fullName: string;
  grade: string;
  city: string;
  bio: string;
  interests: string[];
  avatarUrl?: string;
  resumeUrl?: string;
  resumeName?: string;
  resumeSize?: string;
  resumeUpdatedAt?: string;
  isDemo: boolean;
}

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Пожалуйста, введите email и пароль." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder-project");

  if (isPlaceholder) {
    // Graceful local demo mode
    const cookieStore = await cookies();
    cookieStore.set("wintality_demo_session", "true", { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_email", email, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    redirect(redirectTo);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect(redirectTo);
}

export async function signupAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string) || "Студент Wintality";
  const grade = (formData.get("grade") as string) || "10 класс";
  const city = (formData.get("city") as string) || "Алматы";
  const bio = (formData.get("bio") as string) || "";
  const interestsRaw = formData.get("interests") as string;

  let interests: string[] = [];
  try {
    interests = interestsRaw ? JSON.parse(interestsRaw) : [];
  } catch {
    interests = interestsRaw ? interestsRaw.split(",").map((s) => s.trim()).filter(Boolean) : [];
  }

  if (!email || !password) {
    return { error: "Заполните все обязательные поля." };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder-project");

  if (isPlaceholder) {
    const cookieStore = await cookies();
    cookieStore.set("wintality_demo_session", "true", { path: "/", httpOnly: true, maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_email", email, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_name", fullName, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_grade", grade, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_city", city, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_bio", bio, { path: "/", maxAge: 60 * 60 * 24 * 7 });
    cookieStore.set("wintality_user_interests", JSON.stringify(interests), { path: "/", maxAge: 60 * 60 * 24 * 7 });
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        grade,
        city,
        bio,
        interests,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.user) {
    // Persist full profile to public.profiles table
    try {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        grade,
        city,
        bio,
        interests,
        updated_at: new Date().toISOString(),
      });
    } catch (profileErr) {
      console.error("Error upserting profile:", profileErr);
    }
  }

  if (data.session) {
    redirect("/dashboard");
  } else {
    return { success: "На вашу почту отправлено письмо для подтверждения регистрации!" };
  }
}

export async function logoutAction() {
  const supabase = await createClient();
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.error("Signout error:", err);
  }

  const cookieStore = await cookies();
  cookieStore.delete("wintality_demo_session");
  cookieStore.delete("wintality_user_email");
  cookieStore.delete("wintality_user_name");
  cookieStore.delete("wintality_user_grade");
  cookieStore.delete("wintality_user_city");
  cookieStore.delete("wintality_user_bio");
  cookieStore.delete("wintality_user_interests");
  cookieStore.delete("wintality_user_resume_url");
  cookieStore.delete("wintality_user_resume_name");
  cookieStore.delete("wintality_user_resume_size");
  cookieStore.delete("wintality_user_resume_date");

  redirect("/");
}

export async function saveResumeAction(data: {
  resumeUrl: string;
  resumeName: string;
  resumeSize: string;
}) {
  const cookieStore = await cookies();
  cookieStore.set("wintality_user_resume_url", data.resumeUrl, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set("wintality_user_resume_name", data.resumeName, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set("wintality_user_resume_size", data.resumeSize, { path: "/", maxAge: 60 * 60 * 24 * 30 });
  cookieStore.set("wintality_user_resume_date", new Date().toISOString(), { path: "/", maxAge: 60 * 60 * 24 * 30 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder-project");
  if (!isPlaceholder) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("profiles").upsert({
          id: user.id,
          resume_url: data.resumeUrl,
          resume_filename: data.resumeName,
          resume_size: data.resumeSize,
          resume_updated_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error("Error saving resume in profile:", err);
    }
  }

  return { success: true };
}

export async function deleteResumeAction() {
  const cookieStore = await cookies();
  cookieStore.delete("wintality_user_resume_url");
  cookieStore.delete("wintality_user_resume_name");
  cookieStore.delete("wintality_user_resume_size");
  cookieStore.delete("wintality_user_resume_date");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder-project");
  if (!isPlaceholder) {
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from("profiles")
          .update({
            resume_url: null,
            resume_filename: null,
            resume_size: null,
            resume_updated_at: null,
          })
          .eq("id", user.id);
      }
    } catch (err) {
      console.error("Error deleting resume from profile:", err);
    }
  }

  return { success: true };
}

export async function getCurrentUser(): Promise<CurrentUserData | null> {
  const cookieStore = await cookies();
  const hasDemo = cookieStore.get("wintality_demo_session")?.value === "true";
  const demoEmail = cookieStore.get("wintality_user_email")?.value || "ameli@wintality.kz";
  const demoName = cookieStore.get("wintality_user_name")?.value || "Жанибек Абубакиров";
  const demoGrade = cookieStore.get("wintality_user_grade")?.value || "10 класс";
  const demoCity = cookieStore.get("wintality_user_city")?.value || "Алматы";
  const demoBio =
    cookieStore.get("wintality_user_bio")?.value ||
    "Учусь в 10 классе, ориентируюсь на поступление в Nazarbayev University на грант и подготовку к Республиканской олимпиаде по экономике и программированию.";

  let demoInterests: string[] = [
    "Олимпиадная математика",
    "Machine Learning & AI",
    "FinTech & Инвестиции",
    "FLEX & Международные гранты",
  ];
  try {
    const raw = cookieStore.get("wintality_user_interests")?.value;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        demoInterests = parsed;
      }
    }
  } catch {}

  const demoResumeUrl = cookieStore.get("wintality_user_resume_url")?.value;
  const demoResumeName = cookieStore.get("wintality_user_resume_name")?.value || "Zhanibek_Abubakirov_Harvard_CV.pdf";
  const demoResumeSize = cookieStore.get("wintality_user_resume_size")?.value || "1.2 MB";
  const demoResumeDate = cookieStore.get("wintality_user_resume_date")?.value || new Date().toISOString();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const isPlaceholder = !supabaseUrl || supabaseUrl.includes("placeholder-project");

  if (isPlaceholder || hasDemo) {
    return {
      id: "demo-user-id",
      email: demoEmail,
      fullName: demoName,
      grade: demoGrade,
      city: demoCity,
      bio: demoBio,
      interests: demoInterests,
      avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Zhanibek&backgroundColor=18181b",
      resumeUrl: demoResumeUrl || "/docs/demo_resume.pdf",
      resumeName: demoResumeName,
      resumeSize: demoResumeSize,
      resumeUpdatedAt: demoResumeDate,
      isDemo: true,
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const userMeta = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email,
    fullName: profile?.full_name || userMeta.full_name || "Студент Wintality",
    grade: profile?.grade || userMeta.grade || "10 класс",
    city: profile?.city || userMeta.city || "Алматы",
    bio: profile?.bio || userMeta.bio || "",
    interests: profile?.interests || userMeta.interests || demoInterests,
    avatarUrl: profile?.avatar_url || userMeta.avatar_url,
    resumeUrl: profile?.resume_url || userMeta.resume_url,
    resumeName: profile?.resume_filename || userMeta.resume_filename,
    resumeSize: profile?.resume_size || userMeta.resume_size,
    resumeUpdatedAt: profile?.resume_updated_at || userMeta.resume_updated_at,
    isDemo: false,
  };
}
