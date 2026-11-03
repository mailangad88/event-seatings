import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// Favicon: Beyond Chiavari initials.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#26201b",
          color: "#d8c29a",
          fontSize: 36,
          fontFamily: "serif",
        }}
      >
        BC
      </div>
    ),
    size,
  );
}
