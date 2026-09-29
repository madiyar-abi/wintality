import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Wintality — Платформа возможностей для школьников";
    const category = searchParams.get("category") || "EdTech Platform";
    const location = searchParams.get("location") || "Казахстан 🇰🇿 & Мир 🌍";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "space-between",
            backgroundColor: "#09090b",
            padding: "60px 80px",
            fontFamily: "sans-serif",
            color: "#fafafa",
          }}
        >
          {/* Top Brand Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                backgroundColor: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontWeight: "900",
                fontSize: "24px",
              }}
            >
              W
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "28px", fontWeight: "bold", letterSpacing: "-0.5px" }}>
                Wintality
              </span>
              <span style={{ fontSize: "14px", color: "#a1a1aa", textTransform: "uppercase", letterSpacing: "1px" }}>
                AI Deadline & Opportunity Engine
              </span>
            </div>
          </div>

          {/* Main Title & Scope */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "900px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "rgba(37, 99, 235, 0.15)",
                  color: "#60a5fa",
                  border: "1px solid rgba(37, 99, 235, 0.3)",
                  padding: "6px 14px",
                  borderRadius: "9999px",
                }}
              >
                {category}
              </span>
              <span style={{ fontSize: "14px", color: "#a1a1aa" }}>• {location}</span>
            </div>

            <h1
              style={{
                fontSize: "48px",
                fontWeight: "900",
                lineHeight: "1.15",
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Footer Stats & URL */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              borderTop: "1px solid #27272a",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "32px" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#60a5fa" }}>100+</span>
                <span style={{ fontSize: "12px", color: "#71717a" }}>Программ РК & Мира</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "20px", fontWeight: "bold", color: "#34d399" }}>Wintality AI</span>
                <span style={{ fontSize: "12px", color: "#71717a" }}>AI Скоринг & Аудит</span>
              </div>
            </div>

            <span style={{ fontSize: "16px", fontWeight: "bold", color: "#a1a1aa", letterSpacing: "0.5px" }}>
              wintality.kz
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate OG Image", { status: 500 });
  }
}
