import Link from "next/link";
import { ChairArt } from "@/components/ChairArt";
import { getChair } from "@/data/chairs";

export default function NotFound() {
  const chair = getChair("ghost");
  return (
    <div className="container-x grid items-center gap-12 py-28 md:grid-cols-[1fr_1fr]">
      <div className="text-center md:text-left">
        <p className="eyebrow justify-center md:justify-start">404</p>
        <h1 className="headline mt-6 text-6xl sm:text-8xl">
          This seat is <em className="text-gold">empty</em>
        </h1>
        <p className="mt-6 text-muted">We couldn&apos;t find the page you were looking for.</p>
        <div className="mt-12 flex flex-wrap justify-center gap-4 md:justify-start">
          <Link href="/" className="btn-primary">Return home</Link>
          <Link href="/chairs" className="btn-ghost">Browse chairs</Link>
        </div>
      </div>
      {chair && <ChairArt chair={chair} className="mx-auto aspect-[4/5] w-full max-w-sm" />}
    </div>
  );
}
