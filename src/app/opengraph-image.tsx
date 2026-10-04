import { ImageResponse } from "next/og";

export const alt = "Event Seatings: seating beyond Chiavari";
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
          background: "#f7f3ec",
          color: "#1b1815",
          padding: 80,
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 26, letterSpacing: 8, color: "#a88a5a", textTransform: "uppercase", display: "flex" }}>
          2027 Founding Season · St. Charles, IL
        </div>
        <div style={{ fontSize: 120, lineHeight: 1.02, display: "flex", flexDirection: "column" }}>
          <span>Seating, beyond</span>
          <span style={{ color: "#a88a5a" }}>Chiavari.</span>
        </div>
        <div style={{ fontSize: 34, display: "flex" }}>Event Seatings</div>
      </div>
    ),
    size,
  );
}
