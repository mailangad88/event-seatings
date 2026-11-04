import "server-only";
import { del, get, list, put } from "@vercel/blob";
import { isTransient, withRetry } from "./retry";
import type { Lead } from "./store";

// Backup lead store on Vercel Blob (one private JSON file per lead, lead-store/<id>.json).
// Switched on when a Blob store is connected to the project. Vercel adds either BLOB_READ_WRITE_TOKEN (older
// connections) or BLOB_STORE_ID, which @vercel/blob uses with the deployment's OIDC token (newer connections).
// - With no database (Supabase not set up) it is where leads live, so /admin still shows them.
// - With a database it only holds leads the database refused (outage, bad key). The daily recovery job
//   (/api/cron/lead-recovery) copies them into the database and removes them here.
// The store must be created with private access: leads hold names, emails and phone numbers.

const PREFIX = "lead-store/";
const path = (id: string) => `${PREFIX}${id}.json`;
const safeId = (id: string) => /^[A-Za-z0-9-]{8,64}$/.test(id);

export const backupConfigured = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID);

const retry = <T>(fn: () => Promise<T>) => withRetry(fn, { attempts: 3, baseMs: 300, shouldRetry: isTransient });

// Parsed lead files kept per server instance, keyed by path and the file's upload time. Listing the store is one
// cheap call per 1,000 leads; only files that are new or changed since the last list get downloaded again, so
// /admin stays quick as leads pile up instead of re-reading every file on every page.
const fileCache = new Map<string, { uploadedAt: number; lead: Lead }>();
const FILE_CACHE_MAX = 20_000;

export async function backupPutLead(lead: Lead) {
  if (!safeId(lead.id)) throw new Error(`bad lead id ${lead.id}`);
  fileCache.delete(path(lead.id));
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
  fileCache.delete(path(id));
  await retry(() => del(path(id)));
}

// Every lead in the backup store, newest first. Unchanged files come from the per-instance cache; the rest are
// read 24 at a time.
export async function backupListLeads(): Promise<Lead[]> {
  const files: { pathname: string; id: string; uploadedAt: number }[] = [];
  let cursor: string | undefined;
  do {
    const page = await retry(() => list({ prefix: PREFIX, cursor, limit: 1000 }));
    for (const b of page.blobs)
      files.push({ pathname: b.pathname, id: b.pathname.slice(PREFIX.length).replace(/\.json$/, ""), uploadedAt: new Date(b.uploadedAt).getTime() });
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const out: Lead[] = [];
  const toFetch: typeof files = [];
  for (const f of files) {
    const hit = fileCache.get(f.pathname);
    if (hit && hit.uploadedAt === f.uploadedAt) out.push(hit.lead);
    else toFetch.push(f);
  }
  for (let i = 0; i < toFetch.length; i += 24) {
    const batch = toFetch.slice(i, i + 24);
    const leads = await Promise.all(batch.map((f) => backupGetLead(f.id).catch(() => undefined)));
    leads.forEach((l, j) => {
      if (!l) return;
      out.push(l);
      fileCache.set(batch[j].pathname, { uploadedAt: batch[j].uploadedAt, lead: l });
    });
  }
  // Forget files that were deleted elsewhere, and keep the cache bounded.
  if (fileCache.size > files.length || fileCache.size > FILE_CACHE_MAX) {
    const live = new Set(files.map((f) => f.pathname));
    for (const k of fileCache.keys()) if (!live.has(k) || fileCache.size > FILE_CACHE_MAX) fileCache.delete(k);
  }
  // Copies, so a caller changing a lead object can't change the cached one.
  return out.map((l) => structuredClone(l)).sort((a, b) => b.created_at.localeCompare(a.created_at));
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
