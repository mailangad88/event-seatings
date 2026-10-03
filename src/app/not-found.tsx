import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 font-serif text-5xl">This seat is empty</h1>
      <p className="mt-4 text-muted">We couldn&apos;t find that page.</p>
      <Link href="/" className="btn-primary mt-8">Back home</Link>
    </div>
  );
}
