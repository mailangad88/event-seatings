import files from "@/data/public-files.json";

// Which files exist under public/, from the list scripts/public-files.mjs writes before each build.
// Use this instead of fs.existsSync(path.join(process.cwd(), "public", ...)): a disk check makes the build
// copy the whole public/ folder into every server function.
const set = new Set<string>(files as string[]);

export function hasPublicFile(src?: string | null): src is string {
  if (!src || !src.startsWith("/")) return false;
  const clean = src.split(/[?#]/)[0];
  if (set.has(clean)) return true;
  try {
    return set.has(decodeURI(clean));
  } catch {
    return false;
  }
}
