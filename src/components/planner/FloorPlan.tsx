import type { layout } from "@/lib/event-plan";

type Plan = ReturnType<typeof layout>;

// A rough top-down sketch of the room: stage and dance floor up front, tables around them,
// bar and buffet along the walls. Drawn in feet, then scaled to fit.
export function FloorPlan({ plan }: { plan: Plan }) {
  const W = plan.width;
  const danceSide = plan.dance ? Math.ceil(Math.sqrt(plan.dance)) * 3 : 0;
  const stageW = plan.stage ? 16 : 0;
  const tablesNeeded = plan.rounds + plan.banquets;

  // Lay tables on a grid (10' for rounds, 10' x 12' for banquets), skipping the dance floor and stage.
  const cell = 10;
  const margin = 7; // keeps the lounge (left wall) and bar (right wall) clear of tables
  const cols = Math.max(1, Math.floor((W - 2 * margin) / cell));
  const reserved = { x0: (W - Math.max(danceSide, stageW)) / 2 - 3, x1: (W + Math.max(danceSide, stageW)) / 2 + 3, y1: (plan.stage ? 10 : 2) + danceSide + 3 };
  const spots: { x: number; y: number }[] = [];
  for (let row = 0; spots.length < tablesNeeded && row < 200; row++) {
    for (let c = 0; c < cols && spots.length < tablesNeeded; c++) {
      const x = (W - cols * cell) / 2 + c * cell + cell / 2;
      const y = 4 + row * cell + cell / 2;
      if (x > reserved.x0 && x < reserved.x1 && y < reserved.y1) continue;
      spots.push({ x, y });
    }
  }
  const depth = Math.max(plan.depth, (spots.at(-1)?.y ?? 0) + cell / 2 + (plan.buffet ? 10 : 4));
  const scale = 600 / W;
  const H = depth * scale;
  const ft = (n: number) => n * scale;

  return (
    <figure className="mt-4">
      <svg viewBox={`0 0 600 ${H}`} className="w-full rounded-2xl border border-line bg-surface" role="img" aria-label={`Floor plan sketch with ${plan.rounds ? `${plan.rounds} round tables` : `${plan.banquets} banquet tables`}${plan.dance ? ", a dance floor" : ""}${plan.bar ? ", a bar" : ""}${plan.buffet ? " and a buffet" : ""}`}>
        {plan.stage && (
          <g>
            <rect x={ft((W - stageW) / 2)} y={ft(1)} width={ft(stageW)} height={ft(7)} rx={4} fill="var(--espresso)" opacity={0.85} />
            <text x={300} y={ft(5)} textAnchor="middle" fontSize={12} fill="var(--bg)">Stage</text>
          </g>
        )}
        {danceSide > 0 && (
          <g>
            <rect x={ft((W - danceSide) / 2)} y={ft(plan.stage ? 10 : 2)} width={ft(danceSide)} height={ft(danceSide)} fill="var(--gold-soft)" stroke="var(--gold)" strokeDasharray="4 3" />
            <text x={300} y={ft((plan.stage ? 10 : 2) + danceSide / 2) + 4} textAnchor="middle" fontSize={12} fill="var(--ink)">Dance floor</text>
          </g>
        )}
        {spots.map((s, i) =>
          i < plan.rounds ? (
            <g key={i}>
              <circle cx={ft(s.x)} cy={ft(s.y)} r={ft(2.5)} fill="var(--surface-2)" stroke="var(--gold)" />
              {Array.from({ length: 8 }, (_, k) => {
                const a = (k / 8) * Math.PI * 2;
                return <circle key={k} cx={ft(s.x + Math.cos(a) * 3.6)} cy={ft(s.y + Math.sin(a) * 3.6)} r={ft(0.7)} fill="var(--muted)" opacity={0.6} />;
              })}
            </g>
          ) : (
            <rect key={i} x={ft(s.x - 4)} y={ft(s.y - 1.25)} width={ft(8)} height={ft(2.5)} fill="var(--surface-2)" stroke="var(--gold)" />
          ),
        )}
        {plan.bar > 0 && (
          <g>
            <rect x={ft(W - 3)} y={ft(depth * 0.35)} width={ft(2.5)} height={ft(10)} fill="var(--espresso)" opacity={0.8} />
            <text x={ft(W - 4)} y={ft(depth * 0.35 + 5)} textAnchor="end" fontSize={11} fill="var(--muted)">Bar</text>
          </g>
        )}
        {plan.buffet && (
          <g>
            <rect x={ft(W * 0.25)} y={ft(depth - 4)} width={ft(W * 0.5)} height={ft(2.5)} fill="var(--espresso)" opacity={0.8} />
            <text x={300} y={ft(depth - 5)} textAnchor="middle" fontSize={11} fill="var(--muted)">Buffet</text>
          </g>
        )}
        {plan.lounge && (
          <g>
            <rect x={ft(1)} y={ft(depth * 0.4)} width={ft(3)} height={ft(8)} rx={4} fill="var(--sage)" opacity={0.5} />
            <text x={ft(5)} y={ft(depth * 0.4 + 4.5)} fontSize={11} fill="var(--muted)">Lounge</text>
          </g>
        )}
      </svg>
      <figcaption className="mt-2 text-xs text-muted">
        Sketch only: {plan.rounds ? `${plan.rounds} 60" rounds of eight` : `${plan.banquets} banquet tables`}
        {plan.highboys ? `, ${plan.highboys} highboys for mingling` : ""}. Keep 5&apos; aisles for serving and wheelchairs.
      </figcaption>
    </figure>
  );
}
