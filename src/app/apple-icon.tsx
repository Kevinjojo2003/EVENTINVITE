import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS ignores transparency and rounds this itself, so it is drawn as a filled square.
export default function AppleIcon() {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "Mandapam";
  const initial = app.trim()[0]?.toUpperCase() || "M";
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(155deg, #7d1f3a 0%, #4a1526 55%, #241014 100%)",
        }}
      >
        <div style={{ display: "flex", color: "#f6e6c2", fontFamily: "Georgia, serif", fontSize: 100, fontStyle: "italic" }}>{initial}</div>
      </div>
    ),
    size,
  );
}
