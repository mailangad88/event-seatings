import { vendors } from "@/data/vendors";
import { chicagoDay } from "@/lib/admin-view";
import { isLedgerKind, isLedgerMethod, periods, type LedgerRow } from "@/lib/ledger";
import type { Lead } from "@/lib/store";

// Ledger filters shared by /admin/payments and its CSV download, so the download matches what's on screen.
export type LedgerFilters = { kind: string; method: string; period: string; q: string };

export function ledgerFilters(sp: Record<string, string | string[] | undefined>): LedgerFilters {
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string).trim() : "");
  const period = one("period");
  return {
    kind: isLedgerKind(one("kind")) ? one("kind") : "",
    method: isLedgerMethod(one("method")) ? one("method") : "",
    period: period === "this" || period === "last" || /^\d{4}-\d{2}$/.test(period) ? period : "",
    q: one("q").slice(0, 80),
  };
}

export function filterLedger(rows: LedgerRow[], f: LedgerFilters, leads: Lead[] = []): LedgerRow[] {
  const p = periods();
  const range =
    f.period === "this" ? p.thisMonth : f.period === "last" ? p.lastMonth : f.period ? { from: `${f.period}-01`, to: `${f.period}-31` } : undefined;
  const q = f.q.toLowerCase();
  const leadText = new Map(leads.map((l) => [l.id, `${l.name ?? ""} ${l.email}`]));
  return rows.filter((r) => {
    if (f.kind && r.kind !== f.kind) return false;
    if (f.method && r.method !== f.method) return false;
    if (range) {
      const day = chicagoDay(r.created_at);
      if (day < range.from || day > range.to) return false;
    }
    if (q) {
      const vendor = r.vendor_id ? vendors.find((v) => v.id === r.vendor_id)?.name ?? r.vendor_id : "";
      const hay = `${r.note ?? ""} ${vendor} ${r.lead_id ? leadText.get(r.lead_id) ?? "" : ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
