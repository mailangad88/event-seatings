import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { addDays, chicagoDay } from "./admin-view";
import { owedStatements, statements } from "./commissions";
import { listLeads, listPartners, type Lead, type VendorPartner } from "./store";

// The payments ledger (/admin/payments): one list of every money movement.
//
// Two sources are merged:
// - Recorded rows, stored in the Supabase table payments_ledger (supabase/schema.sql), or in .data/db.json under
//   "ledger" without Supabase: cash, Zelle and check payments typed in by hand, commission payments from
//   /admin/invoices, and refunds made from /admin/payments.
// - Rows read from leads: a booking fee is "paid" on the lead itself (Stripe webhook or Mark paid), so those show up
//   here without a stored row. A recorded fee row for the same lead replaces the lead's row, so nothing counts twice.
//
// Amounts are always positive dollars. Refunds are money out: `signed` makes them negative for totals.
// Never store card or bank numbers here; the note is for "Zelle from Maria" or a check number at most.

export const ledgerKinds = [
  { id: "fee", label: "Deposit" },
  { id: "commission", label: "Commission" },
  { id: "refund", label: "Refund" },
  { id: "other", label: "Other" },
] as const;
export type LedgerKind = (typeof ledgerKinds)[number]["id"];
export const isLedgerKind = (v: unknown): v is LedgerKind => ledgerKinds.some((k) => k.id === v);
export const kindLabel = (k: string) => ledgerKinds.find((x) => x.id === k)?.label ?? k;

export const ledgerMethods = [
  { id: "stripe", label: "Card (Stripe)" },
  { id: "zelle", label: "Zelle" },
  { id: "check", label: "Check" },
  { id: "cash", label: "Cash" },
  { id: "other", label: "Other" },
] as const;
export type LedgerMethod = (typeof ledgerMethods)[number]["id"];
export const isLedgerMethod = (v: unknown): v is LedgerMethod => ledgerMethods.some((m) => m.id === v);
export const methodLabel = (m: string) => ledgerMethods.find((x) => x.id === m)?.label ?? m;

export type LedgerEntry = {
  id: string;
  created_at: string; // when the money moved (ISO)
  kind: LedgerKind;
  lead_id?: string;
  vendor_id?: string;
  month?: string; // YYYY-MM, the commission statement month
  amount: number; // USD, always positive
  method: LedgerMethod;
  note?: string;
};
export type NewLedgerEntry = Omit<LedgerEntry, "id" | "created_at"> & { created_at?: string };

// A row as shown on /admin/payments. source "lead" rows come from the lead's fee fields and can't be deleted here.
export type LedgerRow = LedgerEntry & { source: "recorded" | "lead"; signed: number };

let supabase: SupabaseClient | null | undefined;
function sb() {
  if (supabase === undefined) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    supabase = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  }
  return supabase;
}

const dbFile = path.join(process.cwd(), ".data", "db.json");
type LocalDb = { ledger?: LedgerEntry[] } & Record<string, unknown>;

async function readLocal(): Promise<LocalDb> {
  try {
    return JSON.parse(await fs.readFile(dbFile, "utf8"));
  } catch {
    // Same empty shape as src/lib/store.ts, so the other local tables still read correctly after we write the file.
    return { votes: [], leads: [], views: [] };
  }
}
async function writeLocal(db: LocalDb) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
}

// The table doesn't exist until schema.sql is re-run. Reads treat that as empty; writes throw this so the page can say so.
export class LedgerTableMissing extends Error {}
const missing = (e: { code?: string; message: string }) => e.code === "42P01" || e.code === "PGRST205" || /payments_ledger/.test(e.message);

const cents = (n: number) => Math.round(n * 100) / 100;

export async function listLedger(): Promise<LedgerEntry[]> {
  const client = sb();
  if (client) {
    const rows: LedgerEntry[] = [];
    for (let from = 0; ; from += 1000) {
      const { data, error } = await client.from("payments_ledger").select("*").order("created_at", { ascending: false }).range(from, from + 999);
      if (error) {
        if (missing(error)) return [];
        throw error;
      }
      rows.push(...(data ?? []).map((r) => ({ ...r, amount: Number(r.amount) })));
      if (!data || data.length < 1000) return rows;
    }
  }
  return [...((await readLocal()).ledger ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export async function addLedgerEntry(input: NewLedgerEntry): Promise<LedgerEntry> {
  const row: LedgerEntry = { ...input, id: crypto.randomUUID(), created_at: input.created_at ?? new Date().toISOString(), amount: cents(input.amount) };
  for (const k of ["lead_id", "vendor_id", "month", "note"] as const) if (!row[k]) delete row[k];
  const client = sb();
  if (client) {
    const { error } = await client.from("payments_ledger").insert(row);
    if (error) throw missing(error) ? new LedgerTableMissing(error.message) : error;
    return row;
  }
  const db = await readLocal();
  db.ledger = [...(db.ledger ?? []), row];
  await writeLocal(db);
  return row;
}

export async function deleteLedgerEntry(id: string) {
  const client = sb();
  if (client) {
    const { error } = await client.from("payments_ledger").delete().eq("id", id);
    if (error) throw missing(error) ? new LedgerTableMissing(error.message) : error;
    return;
  }
  const db = await readLocal();
  db.ledger = (db.ledger ?? []).filter((r) => r.id !== id);
  await writeLocal(db);
}

const sign = (e: Pick<LedgerEntry, "kind" | "amount">) => (e.kind === "refund" ? -e.amount : e.amount);

// Recorded rows plus booking fees read from leads, newest first.
export function mergeLedger(recorded: LedgerEntry[], leads: Lead[]): LedgerRow[] {
  const rows: LedgerRow[] = recorded.map((r) => ({ ...r, source: "recorded", signed: sign(r) }));
  // A fee recorded by hand stands in for the lead's own "paid" mark. A Stripe payment always keeps its own row.
  const recordedFee = new Set(recorded.filter((r) => r.kind === "fee" && r.lead_id).map((r) => r.lead_id));
  const recordedRefund = new Set(recorded.filter((r) => r.kind === "refund" && r.lead_id).map((r) => r.lead_id));
  for (const l of leads) {
    if ((l.fee_status !== "paid" && l.fee_status !== "refunded") || !l.fee_amount) continue;
    const method: LedgerMethod = l.stripe_session_id ? "stripe" : "other";
    // Older refunds cleared fee_paid_at, so the payment date is lost; show both rows on the refund date so they net to zero.
    const paidAt = l.fee_paid_at ?? l.updated_at ?? l.created_at;
    if (l.stripe_session_id || !recordedFee.has(l.id)) {
      const note = l.stripe_session_id ? "Card payment through Stripe" : l.fee_paid_at ? "Marked paid on the lead" : "Marked paid on the lead (date not saved)";
      rows.push({ id: `lead-fee-${l.id}`, created_at: paidAt, kind: "fee", lead_id: l.id, amount: l.fee_amount, method, note, source: "lead", signed: l.fee_amount });
    }
    if (l.fee_status === "refunded" && !recordedRefund.has(l.id)) {
      const at = l.updated_at ?? paidAt;
      rows.push({ id: `lead-refund-${l.id}`, created_at: at, kind: "refund", lead_id: l.id, amount: l.fee_amount, method, note: "Marked refunded on the lead", source: "lead", signed: -l.fee_amount });
    }
  }
  return rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
}

// count = rows of any kind; feeCount = booking fee payments only.
export type LedgerTotals = { fees: number; feeCount: number; commission: number; other: number; refunds: number; received: number; net: number; count: number };

// Totals for rows whose Chicago day falls in [from, to] (YYYY-MM-DD, both optional, inclusive).
export function ledgerTotals(rows: LedgerRow[], from?: string, to?: string): LedgerTotals {
  const t: LedgerTotals = { fees: 0, feeCount: 0, commission: 0, other: 0, refunds: 0, received: 0, net: 0, count: 0 };
  for (const r of rows) {
    const day = chicagoDay(r.created_at);
    if ((from && day < from) || (to && day > to)) continue;
    t.count += 1;
    if (r.kind === "refund") t.refunds += r.amount;
    else if (r.kind === "fee") {
      t.fees += r.amount;
      t.feeCount += 1;
    }
    else t[r.kind] += r.amount;
  }
  t.received = cents(t.fees + t.commission + t.other);
  t.net = cents(t.received - t.refunds);
  t.fees = cents(t.fees);
  t.commission = cents(t.commission);
  t.other = cents(t.other);
  t.refunds = cents(t.refunds);
  return t;
}

// Calendar ranges in Chicago days. Weeks start on Monday.
export function periods(today = chicagoDay()) {
  const dow = new Date(`${today}T12:00:00Z`).getUTCDay();
  const weekFrom = addDays(today, -((dow + 6) % 7));
  const month = today.slice(0, 7);
  const lastMonthDay = addDays(`${month}-01`, -1);
  return {
    today,
    week: { from: weekFrom, to: today },
    thisMonth: { from: `${month}-01`, to: today },
    lastMonth: { from: `${lastMonthDay.slice(0, 7)}-01`, to: lastMonthDay },
  };
}

export type MoneySummary = {
  thisWeek: LedgerTotals & { from: string };
  thisMonth: LedgerTotals;
  lastMonth: LedgerTotals;
  allTime: LedgerTotals;
  // Proposals sent whose booking fee is not paid yet.
  waiting: { count: number; total: number };
  // Commission statements for finished months that rental partners haven't paid. Overdue = sent over 15 days ago.
  owed: { count: number; total: number; notSentCount: number; notSentTotal: number; overdueCount: number; overdueTotal: number };
};

// The same numbers from data already loaded (no reads).
export function summarizeMoney(rows: LedgerRow[], leads: Lead[], partners: VendorPartner[], today = chicagoDay()): MoneySummary {
  const p = periods(today);
  const waiting = leads.filter((l) => l.proposal_token && (l.fee_status ?? "unpaid") === "unpaid");
  const owed = owedStatements(statements(leads, partners), partners, today);
  const sum = <T>(xs: T[], f: (x: T) => number) => cents(xs.reduce((s, x) => s + f(x), 0));
  const notSent = owed.filter((s) => s.bucket === "not_sent");
  const overdue = owed.filter((s) => s.overdue);
  return {
    thisWeek: { ...ledgerTotals(rows, p.week.from, p.week.to), from: p.week.from },
    thisMonth: ledgerTotals(rows, p.thisMonth.from, p.thisMonth.to),
    lastMonth: ledgerTotals(rows, p.lastMonth.from, p.lastMonth.to),
    allTime: ledgerTotals(rows),
    waiting: { count: waiting.length, total: sum(waiting, (l) => l.fee_amount ?? 0) },
    owed: {
      count: owed.length,
      total: sum(owed, (s) => s.commission),
      notSentCount: notSent.length,
      notSentTotal: sum(notSent, (s) => s.commission),
      overdueCount: overdue.length,
      overdueTotal: sum(overdue, (s) => s.commission),
    },
  };
}

// Everything the Today dashboard needs about money in one call: fees and refunds this week / month,
// proposals waiting on payment and commission owed by rental partners.
export async function moneySummary(today = chicagoDay()): Promise<MoneySummary> {
  const [recorded, leads, partners] = await Promise.all([listLedger(), listLeads(), listPartners()]);
  return summarizeMoney(mergeLedger(recorded, leads), leads, partners, today);
}

// CSV-safe cell: quoted, and stops spreadsheet apps from treating text as a formula.
export function csvCell(v: unknown) {
  if (typeof v === "number") return Number.isFinite(v) ? String(v) : "";
  let s = v == null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
