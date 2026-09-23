import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// The app icon: an initial-seal on the brand's oxblood-to-plum gradient, generated at request
// time (same technique as the invitation's share-card route), so no binary asset is checked in.
export default function Icon() {
  const app = process.env.NEXT_PUBLIC_APP_NAME || "K-Invites";
  const initial = app.trim()[0]?.toUpperCase() || "K";
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 340,
            height: 340,
            borderRadius: "50%",
            border: "6px solid rgba(230,198,127,0.9)",
            color: "#f6e6c2",
            fontFamily: "Georgia, serif",
            fontSize: 200,
            fontStyle: "italic",
          }}
        >
          {initial}
        </div>
      </div>
    ),
    size,
  );
}
