import "server-only";
import { del, get, list, put } from "@vercel/blob";
import { isTransient, withRetry } from "./retry";
import type { Lead } from "./store";

// Backup lead store on Vercel Blob (one private JSON file per lead, lead-store/<id>.json).
// Switched on by BLOB_READ_WRITE_TOKEN, which Vercel adds when a Blob store is connected to the project.
// - With no database (Supabase not set up) it is where leads live, so /admin still shows them.
// - With a database it only holds leads the database refused (outage, bad key). The daily recovery job
//   (/api/cron/lead-recovery) copies them into the database and removes them here.
// The store must be created with private access: leads hold names, emails and phone numbers.

const PREFIX = "lead-store/";
const path = (id: string) => `${PREFIX}${id}.json`;
const safeId = (id: string) => /^[A-Za-z0-9-]{8,64}$/.test(id);

export const backupConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

const retry = <T>(fn: () => Promise<T>) => withRetry(fn, { attempts: 3, baseMs: 300, shouldRetry: isTransient });

export async function backupPutLead(lead: Lead) {
  if (!safeId(lead.id)) throw new Error(`bad lead id ${lead.id}`);
  await retry(() =>
    put(path(lead.id), JSON.stringify(lead), {
      access: "private",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/json",
      cacheControlMaxAge: 60,
    }),
  );
}

export async function backupGetLead(id: string): Promise<Lead | undefined> {
  if (!safeId(id)) return undefined;
  const res = await retry(() => get(path(id), { access: "private", useCache: false }));
  if (!res || res.statusCode !== 200) return undefined;
  return JSON.parse(await new Response(res.stream).text()) as Lead;
}

export async function backupDeleteLead(id: string) {
  if (!safeId(id)) return;
  await retry(() => del(path(id)));
}

// Every lead in the backup store, newest first. Reads up to 8 files at a time.
export async function backupListLeads(): Promise<Lead[]> {
  const ids: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await retry(() => list({ prefix: PREFIX, cursor, limit: 1000 }));
    for (const b of page.blobs) ids.push(b.pathname.slice(PREFIX.length).replace(/\.json$/, ""));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const out: Lead[] = [];
  for (let i = 0; i < ids.length; i += 8) {
    const batch = await Promise.all(ids.slice(i, i + 8).map((id) => backupGetLead(id).catch(() => undefined)));
    for (const l of batch) if (l) out.push(l);
  }
  return out.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// Any other small JSON file in the same private store (visitor activity, reminder settings), by path.
export async function backupGetJson<T>(pathname: string): Promise<T | undefined> {
  const res = await retry(() => get(pathname, { access: "private", useCache: false }));
  if (!res || res.statusCode !== 200) return undefined;
  return JSON.parse(await new Response(res.stream).text()) as T;
}

export async function backupPutJson(pathname: string, value: unknown) {
  await retry(() =>
    put(pathname, JSON.stringify(value), { access: "private", addRandomSuffix: false, allowOverwrite: true, contentType: "application/json", cacheControlMaxAge: 60 }),
  );
}
