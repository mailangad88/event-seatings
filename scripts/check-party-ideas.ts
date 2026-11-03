// Validates src/data/party-ideas: every rental is a featured catalog item, every scene image exists, slugs are unique.
// Run: npx tsx scripts/check-party-ideas.ts
import fs from "node:fs";
import { catalogItems } from "../src/data/catalog";
import { ideas, partyTypes } from "../src/data/party-ideas";

const featured = new Set(catalogItems.filter((i) => i.featured).map((i) => i.id));
const errors: string[] = [];
const checkId = (where: string, id: string) => !featured.has(id) && errors.push(`${where}: "${id}" is not a featured catalog item`);
const checkScene = (where: string, s: string) => !fs.existsSync(`public/rentals/scenes/${s}.webp`) && errors.push(`${where}: missing scene ${s}`);
const plannerIds = ["wedding", "indian-wedding", "corporate", "birthday", "quinceanera", "shower", "graduation", "kids"];

for (const t of partyTypes) {
  if (!plannerIds.includes(t.planner)) errors.push(`${t.slug}: unknown planner event ${t.planner}`);
  checkScene(t.slug, t.scene);
  t.setups.forEach((s) => s.rentals.forEach((id) => checkId(`${t.slug} setup "${s.title}"`, id)));
  t.activities.forEach((a) => a.rentals?.forEach((id) => checkId(`${t.slug} activity "${a.name}"`, id)));
  if (!ideas.some((i) => i.type === t.slug)) errors.push(`${t.slug}: no ideas`);
}
const seen = new Set<string>();
for (const i of ideas) {
  if (seen.has(i.slug)) errors.push(`duplicate idea ${i.slug}`);
  seen.add(i.slug);
  if (!partyTypes.some((t) => t.slug === i.type)) errors.push(`${i.slug}: unknown type ${i.type}`);
  checkScene(i.slug, i.scene);
  i.rentals.forEach((l) => checkId(`${i.slug} rental`, l.id));
  i.activities.forEach((a) => a.rentals?.forEach((id) => checkId(`${i.slug} activity "${a.name}"`, id)));
}
console.log(`${partyTypes.length} party types, ${ideas.length} ideas`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("All party-idea rentals and images check out.");
