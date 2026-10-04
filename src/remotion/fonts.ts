import { continueRender, delayRender, staticFile } from "remotion";

// Fonts ship with the project (public/fonts) so renders never depend on the network.
export const display = "ES Cormorant";
export const displayItalic = "ES Cormorant Italic";
export const sans = "ES Jost";

const faces: [string, string, string][] = [
  [display, "cormorant-garamond-latin-300-normal.woff2", "300"],
  [displayItalic, "cormorant-garamond-latin-300-italic.woff2", "300"],
  [displayItalic, "cormorant-garamond-latin-400-italic.woff2", "400"],
  [sans, "jost-latin-400-normal.woff2", "400"],
  [sans, "jost-latin-500-normal.woff2", "500"],
];

if (typeof document !== "undefined") {
  const handle = delayRender("Loading Event Seatings fonts");
  Promise.all(
    faces.map(async ([family, file, weight]) => {
      const face = new FontFace(family, `url(${staticFile(`fonts/${file}`)}) format("woff2")`, { weight });
      document.fonts.add(await face.load());
    }),
  )
    .catch((err) => console.error("Font load failed", err))
    .finally(() => continueRender(handle));
}
