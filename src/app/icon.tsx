import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation for browser tab favicon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #030712 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
          border: "1.5px solid rgba(56, 189, 248, 0.7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <svg
          width="22"
          height="22"
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
