import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #030712 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          border: "4px solid rgba(56, 189, 248, 0.8)",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M4 7.5L10.5 24.5H14.5L9.5 7.5H4Z" fill="#38bdf8" />
          <path d="M10.5 24.5L16 13L13 7.5L9.5 16L10.5 24.5Z" fill="#2563eb" opacity="0.9" />
          <path d="M21.5 24.5L16 13L19 7.5L22.5 16L21.5 24.5Z" fill="#2563eb" opacity="0.9" />
          <path d="M28 7.5L21.5 24.5H17.5L22.5 7.5H28Z" fill="#38bdf8" />
          <circle cx="16" cy="5.5" r="1.75" fill="#38bdf8" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
