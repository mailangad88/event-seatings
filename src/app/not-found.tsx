import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-36 text-center">
      <p className="eyebrow justify-center">404</p>
      <h1 className="headline mt-6 text-6xl sm:text-8xl">
        This seat is <em className="text-gold">empty</em>
      </h1>
      <p className="mt-6 text-muted">We couldn&apos;t find the page you were looking for.</p>
      <Link href="/" className="btn-primary mt-12">Return home</Link>
    </div>
  );
}
