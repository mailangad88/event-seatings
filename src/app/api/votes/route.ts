import { getChair } from "@/data/chairs";
import { getVisitorVotes, getVoteCounts, setVote } from "@/lib/store";

export const dynamic = "force-dynamic";

const visitorOk = (v: unknown): v is string => typeof v === "string" && /^[a-zA-Z0-9-]{8,64}$/.test(v);

export async function GET(request: Request) {
  const visitor = new URL(request.url).searchParams.get("visitor");
  const [counts, mine] = await Promise.all([
    getVoteCounts(),
    visitorOk(visitor) ? getVisitorVotes(visitor) : Promise.resolve([]),
  ]);
  return Response.json({ counts, mine });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || !getChair(body.chair) || !visitorOk(body.visitor) || typeof body.on !== "boolean") {
    return Response.json({ error: "Invalid vote" }, { status: 400 });
  }
  await setVote(body.chair, body.visitor, body.on);
  return Response.json({ ok: true });
}
