"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { attributionFields } from "@/lib/attribution";
import { track, trackLead } from "@/lib/analytics";

// Drag-and-drop seating layout builder (/tools/floor-plan). Everything is measured in feet.
// Pure SVG + pointer events, no third-party canvas library. The plan autosaves in the browser and can be
// shared as a link (the whole layout is encoded in the URL hash, nothing is stored on our server).

type Kind =
  | "round48"
  | "round60"
  | "round72"
  | "banquet6"
  | "banquet8"
  | "farm8"
  | "head8"
  | "sweetheart"
  | "highboy"
  | "dance"
  | "stage"
  | "bar"
  | "buffet"
  | "dj"
  | "lounge"
  | "ceremony";

type Shape = "circle" | "rect";
type Spec = {
  label: string;
  group: "Tables" | "Zones" | "Ceremony";
  shape: Shape;
  w: number; // feet (diameter for circles)
  h: number;
  seats: (it: Item) => number;
  chairSides?: "around" | "both" | "one";
  resizable?: boolean;
  fill: string;
  catalogId?: string;
};

export type Item = { id: string; kind: Kind; x: number; y: number; r: number; w?: number; h?: number; rows?: number; per?: number; label?: string };
type Plan = { w: number; l: number; items: Item[] };

const CHAIR = 1.5; // an 18" chair footprint
const WALK = 3; // minimum walkway between chair backs, feet

const specs: Record<Kind, Spec> = {
  round48: { label: '48" round (6)', group: "Tables", shape: "circle", w: 4, h: 4, seats: () => 6, chairSides: "around", fill: "#fffdf8", catalogId: "round-48" },
  round60: { label: '60" round (8)', group: "Tables", shape: "circle", w: 5, h: 5, seats: () => 8, chairSides: "around", fill: "#fffdf8", catalogId: "round-60" },
  round72: { label: '72" round (10)', group: "Tables", shape: "circle", w: 6, h: 6, seats: () => 10, chairSides: "around", fill: "#fffdf8", catalogId: "round-72" },
  banquet6: { label: "6' banquet (6)", group: "Tables", shape: "rect", w: 6, h: 2.5, seats: () => 6, chairSides: "both", fill: "#fffdf8", catalogId: "banquet-6ft" },
  banquet8: { label: "8' banquet (8)", group: "Tables", shape: "rect", w: 8, h: 2.5, seats: () => 8, chairSides: "both", fill: "#fffdf8", catalogId: "banquet-8ft" },
  farm8: { label: "8' farm table (8)", group: "Tables", shape: "rect", w: 8, h: 3.3, seats: () => 8, chairSides: "both", fill: "#efe2cc", catalogId: "farm-table" },
  head8: { label: "Head table, one side (4)", group: "Tables", shape: "rect", w: 8, h: 2.5, seats: () => 4, chairSides: "one", fill: "#fffdf8", catalogId: "banquet-8ft" },
  sweetheart: { label: "Sweetheart (2)", group: "Tables", shape: "rect", w: 4, h: 2.5, seats: () => 2, chairSides: "one", fill: "#f6e7e4", catalogId: "sweetheart-table" },
  highboy: { label: '30" highboy', group: "Tables", shape: "circle", w: 2.5, h: 2.5, seats: () => 0, fill: "#fffdf8", catalogId: "cocktail-highboy" },
  dance: { label: "Dance floor", group: "Zones", shape: "rect", w: 15, h: 15, seats: () => 0, resizable: true, fill: "#e9dcc4", catalogId: "dance-floor" },
  stage: { label: "Stage", group: "Zones", shape: "rect", w: 16, h: 8, seats: () => 0, resizable: true, fill: "#3a322a", catalogId: "stage-deck" },
  bar: { label: "Bar", group: "Zones", shape: "rect", w: 8, h: 2.5, seats: () => 0, resizable: true, fill: "#d8c3a0", catalogId: "portable-bar" },
  buffet: { label: "Buffet", group: "Zones", shape: "rect", w: 16, h: 2.5, seats: () => 0, resizable: true, fill: "#e6d7bd", catalogId: "banquet-8ft" },
  dj: { label: "DJ / band", group: "Zones", shape: "rect", w: 8, h: 4, seats: () => 0, resizable: true, fill: "#cfc2b0" },
  lounge: { label: "Lounge", group: "Zones", shape: "rect", w: 10, h: 8, seats: () => 0, resizable: true, fill: "#e8e0d2", catalogId: "lounge-sofa" },
  ceremony: {
    label: "Ceremony rows",
    group: "Ceremony",
    shape: "rect",
    w: 0,
    h: 0,
    seats: (it) => (it.rows ?? 8) * (it.per ?? 5) * 2,
    fill: "transparent",
  },
};

// Ceremony block size: two sections of `per` chairs with a 5' aisle, rows 3' apart.
const ceremonySize = (it: Item) => ({ w: (it.per ?? 5) * CHAIR * 2 + 5, h: (it.rows ?? 8) * 3 });

function size(it: Item) {
  if (it.kind === "ceremony") return ceremonySize(it);
  const s = specs[it.kind];
  return { w: it.w ?? s.w, h: it.h ?? s.h };
}

// Footprint including chairs, as an axis-aligned box (rotation is in 45° steps; 45° uses the rotated box's bounds).
function footprint(it: Item) {
  const s = specs[it.kind];
  const { w, h } = size(it);
  const pad = s.chairSides ? CHAIR + 0.25 : 0;
  let fw = w + (s.chairSides === "around" ? 2 * pad : 0);
  let fh = h + (s.chairSides === "around" || s.chairSides === "both" ? 2 * pad : s.chairSides === "one" ? pad : 0);
  const rot = ((it.r % 180) + 180) % 180;
  if (rot === 90) [fw, fh] = [fh, fw];
  else if (rot === 45 || rot === 135) fw = fh = (fw + fh) / Math.SQRT2;
  return { x0: it.x - fw / 2, x1: it.x + fw / 2, y0: it.y - fh / 2, y1: it.y + fh / 2 };
}

let counter = 0;
const newId = () => `i${Date.now().toString(36)}${(counter++).toString(36)}`;

// Lays out guest tables in a grid, leaving the top of the room for a dance floor when asked.
function autoLayout(w: number, l: number, guests: number, kind: Kind, dance: boolean): Item[] {
  const s = specs[kind];
  const tables = Math.ceil(guests / Math.max(1, s.seats({ id: "", kind, x: 0, y: 0, r: 0 })));
  const items: Item[] = [];
  let top = 3;
  if (dance) {
    const side = guests > 200 ? 21 : guests > 120 ? 18 : guests > 60 ? 15 : 12;
    items.push({ id: newId(), kind: "dance", x: w / 2, y: top + side / 2, r: 0, w: side, h: side });
    top += side + 3;
  }
  const probe = footprint({ id: "", kind, x: 0, y: 0, r: 0 });
  const cellW = probe.x1 - probe.x0 + WALK;
  const cellH = probe.y1 - probe.y0 + WALK;
  const cols = Math.max(1, Math.floor((w - 2) / cellW));
  const left = (w - cols * cellW) / 2 + cellW / 2;
  for (let i = 0; i < tables; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    items.push({ id: newId(), kind, x: left + col * cellW, y: top + cellH / 2 + row * cellH, r: 0 });
  }
  return items;
}

const defaultPlan = (): Plan => ({ w: 60, l: 80, items: autoLayout(60, 80, 120, "round60", true) });

function encode(plan: Plan) {
  const compact = { w: plan.w, l: plan.l, i: plan.items.map((it) => [it.kind, +it.x.toFixed(1), +it.y.toFixed(1), it.r, it.w ?? 0, it.h ?? 0, it.rows ?? 0, it.per ?? 0, it.label ?? ""]) };
  return btoa(unescape(encodeURIComponent(JSON.stringify(compact)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decode(s: string): Plan | null {
  try {
    const json = JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/")))));
    const w = Math.min(400, Math.max(10, Number(json.w)));
    const l = Math.min(400, Math.max(10, Number(json.l)));
    const items: Item[] = (json.i as unknown[][]).slice(0, 400).flatMap((a) => {
      const kind = a[0] as Kind;
      if (!specs[kind]) return [];
      const it: Item = { id: newId(), kind, x: Number(a[1]) || 0, y: Number(a[2]) || 0, r: Number(a[3]) || 0 };
      if (Number(a[4])) it.w = Number(a[4]);
      if (Number(a[5])) it.h = Number(a[5]);
      if (Number(a[6])) it.rows = Number(a[6]);
      if (Number(a[7])) it.per = Number(a[7]);
      if (a[8]) it.label = String(a[8]).slice(0, 30);
      return [it];
    });
    return { w, l, items };
  } catch {
    return null;
  }
}

const storageKey = "floor-plan-v1";

function ItemShape({ it, selected, warn }: { it: Item; selected: boolean; warn: "out" | "tight" | null }) {
  const s = specs[it.kind];
  const { w, h } = size(it);
  const stroke = warn === "out" ? "#b3412e" : warn === "tight" ? "#c9822b" : selected ? "#8a6628" : "#6b6258";
  const sw = selected || warn ? 0.18 : 0.08;
  const chairs: { x: number; y: number; a: number }[] = [];
  const n = s.seats(it);
  if (it.kind === "ceremony") {
    const per = it.per ?? 5;
    for (let r = 0; r < (it.rows ?? 8); r++)
      for (let c = 0; c < per * 2; c++) {
        const side = c < per ? -1 : 1;
        const k = c < per ? per - 1 - c : c - per;
        chairs.push({ x: side * (2.5 + CHAIR / 2 + k * CHAIR), y: -h / 2 + 1.5 + r * 3, a: 0 });
      }
  } else if (s.chairSides === "around") {
    const rad = w / 2 + CHAIR / 2 + 0.1;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      chairs.push({ x: Math.cos(a) * rad, y: Math.sin(a) * rad, a: (a * 180) / Math.PI + 90 });
    }
  } else if (s.chairSides === "both") {
    const per = n / 2;
    for (let i = 0; i < per; i++) {
      const x = -w / 2 + (w / per) * (i + 0.5);
      chairs.push({ x, y: -h / 2 - CHAIR / 2 - 0.1, a: 0 }, { x, y: h / 2 + CHAIR / 2 + 0.1, a: 180 });
    }
  } else if (s.chairSides === "one") {
    for (let i = 0; i < n; i++) chairs.push({ x: -w / 2 + (w / n) * (i + 0.5), y: h / 2 + CHAIR / 2 + 0.1, a: 180 });
  }
  const dark = it.kind === "stage";
  const name = it.label || (s.group === "Zones" ? s.label : it.kind === "ceremony" ? "" : String(n || ""));
  return (
    <g transform={`translate(${it.x} ${it.y}) rotate(${it.r})`}>
      {chairs.map((c, i) => (
        <rect key={i} x={c.x - 0.7} y={c.y - 0.7} width={1.4} height={1.4} rx={0.3} fill="#c9a96a" stroke="#8a6628" strokeWidth={0.06} transform={`rotate(${c.a} ${c.x} ${c.y})`} />
      ))}
      {it.kind === "ceremony" ? (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} fill="none" stroke={stroke} strokeWidth={sw} strokeDasharray="0.6 0.4" />
      ) : s.shape === "circle" ? (
        <circle r={w / 2} fill={s.fill} stroke={stroke} strokeWidth={sw} />
      ) : (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={0.2} fill={s.fill} stroke={stroke} strokeWidth={sw} />
      )}
      {name && (
        <text
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={s.group === "Zones" ? Math.min(1.4, Math.max(0.7, w / 8)) : 0.9}
          fill={dark ? "#faf7f2" : "#1d1a16"}
          transform={`rotate(${-it.r})`}
          style={{ pointerEvents: "none", fontFamily: "system-ui, sans-serif" }}
        >
          {name}
        </text>
      )}
    </g>
  );
}

export function FloorPlanBuilder({ quotableIds }: { quotableIds: string[] }) {
  const [plan, setPlan] = useState<Plan>(defaultPlan);
  const [selected, setSelected] = useState<string | null>(null);
  const [snap, setSnap] = useState(true);
  const [guests, setGuests] = useState(120);
  const [autoKind, setAutoKind] = useState<Kind>("round60");
  const [withDance, setWithDance] = useState(true);
  const [shareUrl, setShareUrl] = useState("");
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const loaded = useRef(false);

  // Load from a shared link first, then from this browser's autosave.
  useEffect(() => {
    const fromHash = window.location.hash.startsWith("#p=") ? decode(window.location.hash.slice(3)) : null;
    let saved: Plan | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      saved = raw ? decode(raw) : null;
    } catch {}
    const start = fromHash ?? saved;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from the URL or browser storage after mount
    if (start) setPlan(start);
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(storageKey, encode(plan));
    } catch {}
  }, [plan]);

  const update = useCallback((id: string, patch: Partial<Item>) => {
    setPlan((p) => ({ ...p, items: p.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) }));
  }, []);

  const toFeet = (e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return { x: 0, y: 0 };
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  function onItemDown(e: React.PointerEvent, it: Item) {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const p = toFeet(e);
    drag.current = { id: it.id, dx: p.x - it.x, dy: p.y - it.y };
    setSelected(it.id);
  }

  function onMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    const p = toFeet(e);
    const round = (v: number) => (snap ? Math.round(v * 2) / 2 : Math.round(v * 10) / 10);
    update(d.id, { x: round(p.x - d.dx), y: round(p.y - d.dy) });
  }

  const add = (kind: Kind) => {
    const it: Item = { id: newId(), kind, x: plan.w / 2, y: plan.l / 2, r: 0, ...(kind === "ceremony" ? { rows: 8, per: 5 } : {}) };
    setPlan((p) => ({ ...p, items: [...p.items, it] }));
    setSelected(it.id);
    track("floor_plan_add", { kind });
  };

  const sel = plan.items.find((it) => it.id === selected) ?? null;

  // Keyboard: arrows nudge, R rotates, Delete removes, D duplicates.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!sel || (e.target as HTMLElement)?.closest?.("input, select, textarea")) return;
      const step = e.shiftKey ? 2 : 0.5;
      const moves: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      if (moves[e.key]) {
        e.preventDefault();
        update(sel.id, { x: sel.x + moves[e.key][0], y: sel.y + moves[e.key][1] });
      } else if (e.key === "r" || e.key === "R") update(sel.id, { r: (sel.r + 45) % 360 });
      else if (e.key === "Delete" || e.key === "Backspace") {
        setPlan((p) => ({ ...p, items: p.items.filter((it) => it.id !== sel.id) }));
        setSelected(null);
      } else if (e.key === "d" || e.key === "D") {
        const copy = { ...sel, id: newId(), x: sel.x + 2, y: sel.y + 2 };
        setPlan((p) => ({ ...p, items: [...p.items, copy] }));
        setSelected(copy.id);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sel, update]);

  // Warnings: outside the room (red) or less than a 3' walkway between chair backs (amber).
  const warnings = useMemo(() => {
    const out = new Map<string, "out" | "tight">();
    const boxes = plan.items.map((it) => ({ it, b: footprint(it) }));
    for (const { it, b } of boxes) if (b.x0 < 0 || b.y0 < 0 || b.x1 > plan.w || b.y1 > plan.l) out.set(it.id, "out");
    const half = WALK / 2;
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i];
        const b = boxes[j];
        // Zones like a dance floor may sit right next to each other; only seating needs a walkway.
        const needs = specs[a.it.kind].seats(a.it) > 0 || specs[b.it.kind].seats(b.it) > 0;
        const gap = needs ? half : 0;
        const overlap = a.b.x0 - gap < b.b.x1 + gap && a.b.x1 + gap > b.b.x0 - gap && a.b.y0 - gap < b.b.y1 + gap && a.b.y1 + gap > b.b.y0 - gap;
        if (overlap) {
          if (!out.has(a.it.id)) out.set(a.it.id, "tight");
          if (!out.has(b.it.id)) out.set(b.it.id, "tight");
        }
      }
    return out;
  }, [plan]);

  const totals = useMemo(() => {
    const counts = new Map<Kind, number>();
    let seats = 0;
    for (const it of plan.items) {
      counts.set(it.kind, (counts.get(it.kind) ?? 0) + 1);
      seats += specs[it.kind].seats(it);
    }
    const ceremonySeats = plan.items.filter((it) => it.kind === "ceremony").reduce((s, it) => s + specs.ceremony.seats(it), 0);
    return { counts, seats, ceremonySeats, receptionSeats: seats - ceremonySeats };
  }, [plan]);

  const area = plan.w * plan.l;
  const quoteIds = [...new Set([...totals.counts.keys()].map((k) => specs[k].catalogId).filter((id): id is string => !!id && quotableIds.includes(id)))];
  const quoteHref = `/quote?items=${quoteIds.join(",")}${totals.receptionSeats ? `&guests=${totals.receptionSeats}` : ""}&from=floor-plan`;

  function share() {
    const url = `${window.location.origin}${window.location.pathname}#p=${encode(plan)}`;
    setShareUrl(url);
    navigator.clipboard?.writeText(url).catch(() => {});
    track("floor_plan_share");
  }

  function svgString() {
    const svg = svgRef.current;
    if (!svg) return "";
    const clone = svg.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    clone.setAttribute("width", String(Math.round((plan.w + 4) * 20)));
    clone.setAttribute("height", String(Math.round((plan.l + 4) * 20)));
    return new XMLSerializer().serializeToString(clone);
  }

  function download(kind: "svg" | "png") {
    const text = svgString();
    const name = `seating-layout-${plan.w}x${plan.l}`;
    const save = (href: string, ext: string) => {
      const a = document.createElement("a");
      a.href = href;
      a.download = `${name}.${ext}`;
      a.click();
    };
    track("floor_plan_download", { format: kind });
    const blobUrl = URL.createObjectURL(new Blob([text], { type: "image/svg+xml" }));
    if (kind === "svg") return save(blobUrl, "svg");
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      save(canvas.toDataURL("image/png"), "png");
      URL.revokeObjectURL(blobUrl);
    };
    img.src = blobUrl;
  }

  const groups = (["Tables", "Zones", "Ceremony"] as const).map((g) => ({ g, kinds: (Object.keys(specs) as Kind[]).filter((k) => specs[k].group === g) }));
  const warnCount = { out: [...warnings.values()].filter((v) => v === "out").length, tight: [...warnings.values()].filter((v) => v === "tight").length };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="grid content-start gap-5 print:hidden">
        <div className="card grid gap-3 p-5">
          <p className="label">Room size (feet)</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm">
              Width
              <input type="number" min={10} max={400} value={plan.w} onChange={(e) => setPlan((p) => ({ ...p, w: Math.min(400, Math.max(10, Number(e.target.value) || 10)) }))} className="field" />
            </label>
            <label className="grid gap-1 text-sm">
              Length
              <input type="number" min={10} max={400} value={plan.l} onChange={(e) => setPlan((p) => ({ ...p, l: Math.min(400, Math.max(10, Number(e.target.value) || 10)) }))} className="field" />
            </label>
          </div>
          <p className="hint">{area.toLocaleString()} sq ft. A 40×60 tent is 2,400 sq ft.</p>
        </div>

        <div className="card grid gap-3 p-5">
          <p className="label">Quick start</p>
          <label className="grid gap-1 text-sm">
            Guests
            <input type="number" min={1} max={2000} value={guests} onChange={(e) => setGuests(Math.min(2000, Math.max(1, Number(e.target.value) || 1)))} className="field" />
          </label>
          <label className="grid gap-1 text-sm">
            Table
            <select value={autoKind} onChange={(e) => setAutoKind(e.target.value as Kind)} className="field">
              {(["round60", "round72", "banquet8", "farm8"] as Kind[]).map((k) => <option key={k} value={k}>{specs[k].label}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={withDance} onChange={(e) => setWithDance(e.target.checked)} /> Include a dance floor
          </label>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => {
              setPlan((p) => ({ ...p, items: autoLayout(p.w, p.l, guests, autoKind, withDance) }));
              setSelected(null);
              track("floor_plan_autolayout", { guests });
            }}
          >
            Lay out tables for me
          </button>
        </div>

        {groups.map(({ g, kinds }) => (
          <div key={g} className="card grid gap-2 p-5">
            <p className="label">Add {g.toLowerCase()}</p>
            <div className="flex flex-wrap gap-2">
              {kinds.map((k) => (
                <button key={k} type="button" className="chip text-xs" onClick={() => add(k)}>+ {specs[k].label}</button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <div className="grid content-start gap-4">
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button type="button" className="btn-ghost btn-sm" onClick={share}>Copy share link</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => download("png")}>Download PNG</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => download("svg")}>Download SVG</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => window.print()}>Print</button>
          <label className="ml-auto flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={snap} onChange={(e) => setSnap(e.target.checked)} /> Snap to 6&quot;
          </label>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              if (window.confirm("Clear every item from the room?")) setPlan((p) => ({ ...p, items: [] }));
            }}
          >
            Clear
          </button>
        </div>
        {shareUrl && <p className="text-sm text-muted print:hidden">Link copied. Anyone with it sees this layout: <span className="break-all">{shareUrl}</span></p>}

        <div className="media overflow-hidden bg-white p-2">
          <svg
            ref={svgRef}
            viewBox={`-2 -2 ${plan.w + 4} ${plan.l + 4}`}
            className="h-auto max-h-[78vh] w-full touch-none select-none"
            role="img"
            aria-label={`Seating layout for a ${plan.w} by ${plan.l} foot room with ${plan.items.length} items and ${totals.seats} seats`}
            onPointerMove={onMove}
            onPointerUp={() => (drag.current = null)}
            onPointerLeave={() => (drag.current = null)}
            onPointerDown={() => setSelected(null)}
          >
            <defs>
              <pattern id="fp-grid" width={5} height={5} patternUnits="userSpaceOnUse">
                <path d="M5 0H0V5" fill="none" stroke="#e7dfd3" strokeWidth={0.06} />
              </pattern>
            </defs>
            <rect x={0} y={0} width={plan.w} height={plan.l} fill="url(#fp-grid)" stroke="#1d1a16" strokeWidth={0.25} />
            <text x={plan.w / 2} y={-0.6} textAnchor="middle" fontSize={1} fill="#6b6258" style={{ fontFamily: "system-ui, sans-serif" }}>{plan.w} ft</text>
            <text x={-0.6} y={plan.l / 2} textAnchor="middle" fontSize={1} fill="#6b6258" transform={`rotate(-90 -0.6 ${plan.l / 2})`} style={{ fontFamily: "system-ui, sans-serif" }}>{plan.l} ft</text>
            {plan.items.map((it) => (
              <g key={it.id} onPointerDown={(e) => onItemDown(e, it)} style={{ cursor: "grab" }}>
                <ItemShape it={it} selected={it.id === selected} warn={warnings.get(it.id) ?? null} />
              </g>
            ))}
          </svg>
        </div>
        <p className="text-xs text-muted print:hidden">
          Drag to move. Select an item, then use arrow keys to nudge, R to rotate, D to duplicate, Delete to remove. Grid squares are 5 ft.
        </p>

        {sel && (
          <div className="card grid gap-3 p-5 print:hidden">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{specs[sel.kind].label}</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-ghost btn-sm" onClick={() => update(sel.id, { r: (sel.r + 45) % 360 })}>Rotate 45°</button>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    const copy = { ...sel, id: newId(), x: sel.x + 2, y: sel.y + 2 };
                    setPlan((p) => ({ ...p, items: [...p.items, copy] }));
                    setSelected(copy.id);
                  }}
                >
                  Duplicate
                </button>
                <button
                  type="button"
                  className="btn-ghost btn-sm"
                  onClick={() => {
                    setPlan((p) => ({ ...p, items: p.items.filter((it) => it.id !== sel.id) }));
                    setSelected(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="grid gap-1 text-sm">
                Label
                <input value={sel.label ?? ""} maxLength={30} onChange={(e) => update(sel.id, { label: e.target.value })} className="field" placeholder={sel.kind.startsWith("round") ? "Table 1" : ""} />
              </label>
              {specs[sel.kind].resizable && (
                <>
                  <label className="grid gap-1 text-sm">
                    Width (ft)
                    <input type="number" min={2} max={100} value={size(sel).w} onChange={(e) => update(sel.id, { w: Math.min(100, Math.max(2, Number(e.target.value) || 2)) })} className="field" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Depth (ft)
                    <input type="number" min={2} max={100} value={size(sel).h} onChange={(e) => update(sel.id, { h: Math.min(100, Math.max(2, Number(e.target.value) || 2)) })} className="field" />
                  </label>
                </>
              )}
              {sel.kind === "ceremony" && (
                <>
                  <label className="grid gap-1 text-sm">
                    Rows
                    <input type="number" min={1} max={40} value={sel.rows ?? 8} onChange={(e) => update(sel.id, { rows: Math.min(40, Math.max(1, Number(e.target.value) || 1)) })} className="field" />
                  </label>
                  <label className="grid gap-1 text-sm">
                    Chairs each side of aisle
                    <input type="number" min={1} max={20} value={sel.per ?? 5} onChange={(e) => update(sel.id, { per: Math.min(20, Math.max(1, Number(e.target.value) || 1)) })} className="field" />
                  </label>
                </>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="label">This layout</p>
            <p className="mt-2 font-heading font-semibold text-4xl">{totals.receptionSeats} <span className="text-base text-muted">seats at tables</span></p>
            {totals.ceremonySeats > 0 && <p className="text-sm text-muted">+ {totals.ceremonySeats} ceremony chairs</p>}
            <ul className="mt-3 grid gap-1 text-sm">
              {[...totals.counts.entries()].map(([k, n]) => (
                <li key={k} className="flex justify-between gap-3">
                  <span>{specs[k].label.replace(/ \(\d+\)$/, "")}</span>
                  <span className="text-muted">× {n}</span>
                </li>
              ))}
            </ul>
            {(warnCount.out > 0 || warnCount.tight > 0) && (
              <p className="mt-3 text-sm" role="status">
                {warnCount.out > 0 && <span className="text-rose">{warnCount.out} item{warnCount.out === 1 ? "" : "s"} outside the room. </span>}
                {warnCount.tight > 0 && <span className="text-amber">{warnCount.tight} item{warnCount.tight === 1 ? " is" : "s are"} closer than a 3 ft walkway between chair backs.</span>}
              </p>
            )}
          </div>
          <div className="card grid content-start gap-3 p-5 print:hidden">
            <p className="label">Next step</p>
            <p className="text-sm leading-6 text-muted">Price these tables, chairs and zones on one quote. Quantities start from your seat count; adjust anything.</p>
            <Link href={quoteHref} className="btn-primary btn-sm" onClick={() => trackLead("quote", "floor-plan", { step: "handoff" })}>
              Price this layout
            </Link>
            <SendPlan plan={plan} seats={totals.seats} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Sends the layout link to the team as a question in the CRM (kind "chat", source "floor-plan").
function SendPlan({ plan, seats }: { plan: Plan; seats: number }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const link = `${window.location.origin}/tools/floor-plan#p=${encode(plan)}`;
    setStatus("sending");
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...attributionFields(),
        ...data,
        kind: "chat",
        source: "floor-plan",
        guest_count: seats || undefined,
        message: `Floor plan (${plan.w}x${plan.l} ft, ${plan.items.length} items, ${seats} seats): ${link}\n\n${data.note ?? ""}`.slice(0, 2000),
      }),
    }).catch(() => null);
    if (res?.ok) {
      trackLead("waitlist", "floor-plan");
      return setStatus("done");
    }
    setError((await res?.json().catch(() => null))?.error ?? "Something went wrong. Please try again.");
    setStatus("error");
  }

  if (status === "done") return <p className="text-sm">Sent. We&apos;ll review your layout and reply by email.</p>;
  if (!open)
    return (
      <button type="button" className="btn-ghost btn-sm" onClick={() => setOpen(true)}>
        Ask us to check this layout
      </button>
    );
  return (
    <form onSubmit={submit} className="grid gap-2">
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <input name="name" placeholder="Your name" className="field" maxLength={80} />
      <input name="email" type="email" required placeholder="Email" className="field" maxLength={254} />
      <input name="event_date" type="date" className="field" aria-label="Event date" />
      <textarea name="note" rows={2} placeholder="Anything we should know about the room?" className="field" maxLength={1500} />
      {status === "error" && <p className="text-sm text-rose">{error}</p>}
      <button className="btn-primary btn-sm" disabled={status === "sending"}>{status === "sending" ? "Sending…" : "Send my layout"}</button>
    </form>
  );
}
