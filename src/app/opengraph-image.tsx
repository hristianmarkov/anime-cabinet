import { ImageResponse } from "next/og";
import { site } from "@/data/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,56,96,0.25), transparent 70%), #09090b",
          color: "#f5f2ea",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            border: "6px solid #f5f2ea",
            padding: "40px 80px",
          }}
        >
          <div style={{ fontSize: 96, fontWeight: 900, letterSpacing: 4 }}>
            ANIME CABINET
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 36, color: "#a3a3ad" }}>
          Custom Anime Portraits, Hand-Drawn From Your Photos
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 28,
            color: "#ff3860",
            fontWeight: 700,
          }}
        >
          24 Styles · 3-Day Delivery · Unlimited Revisions
        </div>
      </div>
    ),
    size
  );
}
