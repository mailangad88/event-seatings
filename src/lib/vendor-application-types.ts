// Vendor sign-up data shared by the onboarding form (browser), the API route and the admin pages.
// No server-only imports here, so the client form can use the option lists and the CSV reader.

export const vendorCategories = [
  "Chairs",
  "Tables",
  "Linens",
  "Dinnerware & glassware",
  "Tents",
  "Lounge furniture",
  "Lighting & decor",
  "Dance floors & staging",
  "Concessions & games",
  "Photo booths",
  "AV & sound",
  "Restrooms & power",
  "Fencing & crowd control",
] as const;

export const vendorAreas = [
  "Chicago (city)",
  "North Shore",
  "Northwest suburbs",
  "Western suburbs (DuPage)",
  "Fox Valley (Kane)",
  "South suburbs",
  "Southwest suburbs (Will)",
  "Lake County",
  "McHenry County",
  "Northwest Indiana",
] as const;

export const leadTimes = ["Same week", "1-2 weeks", "2-4 weeks", "1 month or more", "Depends on the order"] as const;
export const setupOptions = ["Yes, always", "Yes, for a fee", "Delivery only", "Varies by item"] as const;
export const weekendOptions = ["Yes", "Extra charge", "No"] as const;
export const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const paymentMethods = ["Credit card", "ACH / bank transfer", "Check", "Cash", "Zelle", "Venmo"] as const;
export const depositOptions = ["No deposit", "25% at booking", "50% at booking", "Paid in full at booking", "Other"] as const;
export const insuranceOptions = [
  { id: "yes", label: "Yes, I can send a certificate" },
  { id: "in_progress", label: "Getting it now" },
  { id: "no", label: "No" },
] as const;
export const commissionPayOptions = ["ACH / bank transfer", "Check", "Card on file"] as const;

// Review steps, in order. "submitted" = waiting for us; "needs_info" = we asked the vendor for something.
export const applicationStatuses = [
  { id: "submitted", label: "New" },
  { id: "reviewing", label: "Reviewing" },
  { id: "needs_info", label: "Waiting on vendor" },
  { id: "approved", label: "Approved" },
  { id: "declined", label: "Not a fit" },
] as const;
export type ApplicationStatus = (typeof applicationStatuses)[number]["id"];
export const applicationStatusLabel = (s?: string) => applicationStatuses.find((x) => x.id === s)?.label ?? "New";
export const isApplicationStatus = (s: unknown): s is ApplicationStatus => applicationStatuses.some((x) => x.id === s);

// What the vendor sees on their status page for each step.
export const vendorFacingStatus: Record<ApplicationStatus, { title: string; text: string }> = {
  submitted: {
    title: "We have your application",
    text: "We'll call you within one business day to go over your details and price list.",
  },
  reviewing: {
    title: "We're checking your details",
    text: "We're going through your price list and service area. We'll call if anything is unclear.",
  },
  needs_info: {
    title: "We need something from you",
    text: "Please check your email. We've asked for a detail or file before we can set up your listing.",
  },
  approved: {
    title: "You're approved",
    text: "We'll send the one-page partner agreement and a preview of your listing. Nothing goes live until you've checked it.",
  },
  declined: {
    title: "Not a fit right now",
    text: "We can't take this application on at the moment. We've emailed you the reason, and you're welcome to apply again later.",
  },
};

// One row of a vendor's price list, read from our CSV template or typed in by hand.
export type PriceItem = {
  category?: string;
  name: string;
  specs?: string;
  colors?: string;
  unit?: string;
  price?: number;
  min_qty?: number;
  setup_included?: boolean;
  notes?: string;
};

export type ApplicationActivity = { at: string; type: "note" | "status" | "call" | "email"; text: string };

export type VendorApplication = {
  id: string;
  created_at: string;
  updated_at?: string;
  status: ApplicationStatus;
  status_token: string; // 32 hex characters, the key to the vendor's own status page
  // Company
  company: string;
  website?: string;
  contact_name: string;
  contact_role?: string;
  email: string;
  phone: string;
  years_in_business?: string;
  // What and where
  categories: string[];
  areas: string[];
  area_notes?: string;
  // How they work
  order_minimum?: string;
  lead_time?: string;
  setup?: string;
  weekends?: string;
  open_days?: string[];
  max_events_per_day?: number;
  blackout_dates?: string;
  // Prices
  price_list_url?: string;
  price_items?: PriceItem[];
  // Payments and billing
  deposit_policy?: string;
  payment_methods?: string[];
  damage_waiver?: string;
  billing_name?: string;
  billing_email?: string;
  commission_pay?: string;
  insurance?: string;
  // Photos and agreement
  photo_permission?: "yes" | "no";
  photo_link?: string;
  agreed_terms_at?: string;
  notes?: string;
  source?: string;
  page_path?: string;
  // Admin side
  linked_vendor_id?: string;
  admin_notes?: string;
  activity?: ApplicationActivity[];
};

export type NewVendorApplication = Omit<VendorApplication, "id" | "created_at" | "status" | "status_token" | "activity">;

// Reads a CSV price list (our template's columns, or anything close) into rows. Handles quoted cells.
// Returns at most 1,000 rows; rows without an item name are skipped.
export function parsePriceCsv(text: string): PriceItem[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  if (rows.length < 2) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase().replace(/[^a-z]+/g, "_"));
  const col = (...names: string[]) => head.findIndex((h) => names.some((n) => h === n || h.startsWith(n)));
  const at = {
    category: col("category"),
    name: col("item_name", "item", "name", "product", "description"),
    specs: col("size", "spec"),
    colors: col("color", "finish"),
    unit: col("unit"),
    price: col("price", "rate", "cost"),
    min: col("minimum", "min"),
    setup: col("setup"),
    notes: col("note"),
  };
  if (at.name < 0) return [];
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim().slice(0, 200) : "");
  const num = (s: string) => {
    const n = Number(s.replace(/[$,\s]/g, ""));
    return s && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : undefined;
  };
  const out: PriceItem[] = [];
  for (const r of rows.slice(1)) {
    const name = get(r, at.name);
    if (!name) continue;
    const setup = get(r, at.setup).toLowerCase();
    out.push({
      name,
      category: get(r, at.category) || undefined,
      specs: get(r, at.specs) || undefined,
      colors: get(r, at.colors) || undefined,
      unit: get(r, at.unit) || undefined,
      price: num(get(r, at.price)),
      min_qty: num(get(r, at.min)),
      setup_included: setup ? ["yes", "y", "true", "included"].includes(setup) : undefined,
      notes: get(r, at.notes) || undefined,
    });
    if (out.length >= 1000) break;
  }
  return out;
}
