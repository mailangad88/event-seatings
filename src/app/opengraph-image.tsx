import { ImageResponse } from "next/og";
import { logoDataUri, logoWidth } from "@/components/brand/logo-svg";

export const alt = "Beyond Chiavari logo: event rentals in Chicago and the suburbs";
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
          justifyContent: "space-between",
          background: "#f6efe4",
          color: "#2a1519",
          padding: 80,
          borderBottom: "18px solid #7a1f2e",
          fontFamily: "serif",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img src={logoDataUri("light")} width={logoWidth(120)} height={120} />
        <div style={{ fontSize: 64, lineHeight: 1.1, display: "flex", flexDirection: "column" }}>
          <span>Chairs, tables, linens and tents</span>
          <span style={{ color: "#7a1f2e" }}>for every Chicago event.</span>
        </div>
        <div style={{ fontSize: 30, color: "#835a12", display: "flex" }}>Free quotes from local rental shops · beyondchiavari.com</div>
      </div>
    ),
    size,
  );
}
