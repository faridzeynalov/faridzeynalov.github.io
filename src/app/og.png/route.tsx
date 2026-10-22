import { ImageResponse } from "next/og";
import { LOGO_PATH, LOGO_VIEWBOX } from "@/components/layout/logo-path";
import { profile } from "@/data/profile";

// Rendered once at build time into `out/og.png` — a real .png so static hosts send the right
// content type to social crawlers.
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0a0a0c",
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        color: "#ededef",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <svg width={74} height={64} viewBox={LOGO_VIEWBOX}>
          <path d={LOGO_PATH} fill="#ededef" />
        </svg>
        <div style={{ fontSize: 26, color: "#a6a6b0" }}>{profile.location}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>
          {profile.name}
        </div>
        <div style={{ fontSize: 44, color: "#a6a6b0", letterSpacing: -1 }}>
          {`${profile.role} · React · Next.js · TypeScript`}
        </div>
      </div>
      <div style={{ display: "flex", gap: 40, fontSize: 26, color: "#ff8a5b" }}>
        <span>{`${profile.yearsOfExperience} years in production`}</span>
        <span>{`${profile.sitesShipped} websites shipped`}</span>
      </div>
    </div>,
    { width: 1200, height: 630 },
  );
}
