import { ARCH, ARCH_LINE, CHAIR_THICK, CHAIR_THIN, FINIALS, FINIAL_R, LINE_GAP, NAME_CAP, NAME_PATH, NAME_WIDTH, SEAT, TAG_CAP, TAG_PATH, TAG_WIDTH, THIN_RATIO } from "./logo-paths";

// The horizontal logo as a standalone SVG string, for places that can't use CSS tokens:
// social share images (next/og), emails. Same drawing as <BrandMark> + <BrandName> and public/brand/*.svg.

const THEMES = {
  light: { arch: "#7a1f2e", chair: "#d9b26a", name: "#2a1519", tag: "#835a12" },
  dark: { arch: "#d9b26a", chair: "#2a1519", name: "#f6ece2", tag: "#d9b26a" },
};

export function logoSvg(theme: keyof typeof THEMES = "light") {
  const c = THEMES[theme];
  const textX = 82;
  const top = (64 - (NAME_CAP + LINE_GAP + TAG_CAP)) / 2 + 2;
  const width = textX + Math.max(NAME_WIDTH, TAG_WIDTH) + 2;
  const seat = Object.entries(SEAT).map(([k, v]) => `${k}="${v}"`).join(" ");
  const line = `stroke="${c.chair}" stroke-linecap="round" stroke-linejoin="round" fill="none"`;
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width.toFixed(1)} 64" width="${width.toFixed(1)}" height="64">` +
    `<path d="${ARCH}" fill="${c.arch}"/>` +
    `<path d="${ARCH_LINE}" fill="none" stroke="${c.chair}" stroke-width="0.9" opacity="0.55"/>` +
    `<path ${line} stroke-width="2" d="${CHAIR_THICK}"/><path ${line} stroke-width="${2 * THIN_RATIO}" d="${CHAIR_THIN}"/>` +
    `<rect ${seat} fill="${c.chair}"/>` +
    FINIALS.map(([cx, cy]) => `<circle cx="${cx}" cy="${cy}" r="${FINIAL_R}" fill="${c.chair}"/>`).join("") +
    `<path fill="${c.name}" transform="translate(${textX} ${(top + NAME_CAP).toFixed(2)})" d="${NAME_PATH}"/>` +
    `<path fill="${c.tag}" transform="translate(${textX} ${(top + NAME_CAP + LINE_GAP + TAG_CAP).toFixed(2)})" d="${TAG_PATH}"/>` +
    `</svg>`;
  return { svg, width, height: 64 };
}

/** data: URI of the horizontal logo, sized for an <img> in next/og. */
export function logoDataUri(theme: keyof typeof THEMES = "light") {
  return `data:image/svg+xml;base64,${Buffer.from(logoSvg(theme).svg).toString("base64")}`;
}

/** Width for a given height, keeping the logo's proportions. */
export function logoWidth(height: number) {
  const { width } = logoSvg();
  return Math.round((width / 64) * height);
}
