import { ImageResponse } from "next/og";
import { logoDataUri, logoWidth } from "@/components/brand/logo-svg";

export const ogSize = { width: 1200, height: 630 };

// Shared social card for local and event pages.
export function ogCard({ eyebrow, title, footer }: { eyebrow: string; title: string; footer: string }) {
  const [before, em, after] = title.includes("*") ? title.split("*") : [title, "", ""];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#12100d",
          color: "#efe4cf",
          padding: 80,
          fontFamily: "serif",
          border: "14px solid #1a1713",
        }}
      >
        <div style={{ fontSize: 24, letterSpacing: 8, color: "#c9a96a", textTransform: "uppercase", display: "flex" }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 86, lineHeight: 1.05, display: "flex", flexWrap: "wrap" }}>
          <span>{before}</span>
          {em ? <span style={{ color: "#c9a96a", fontStyle: "italic", margin: "0 18px" }}>{em}</span> : null}
          {after ? <span>{after}</span> : null}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 28, color: "#a89d87" }}>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img src={logoDataUri("dark")} width={logoWidth(56)} height={56} />
          <span>{footer}</span>
        </div>
      </div>
    ),
    ogSize,
  );
}
