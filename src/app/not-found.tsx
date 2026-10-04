import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-x py-28 text-center">
      <span className="eyebrow">404</span>
      <h1 className="mt-4 display text-5xl leading-[0.95] sm:text-7xl">this seat is <span className="font-italic font-normal normal-case tracking-normal">empty</span></h1>
      <p className="mt-4 text-muted">We couldn&apos;t find that page. 🪑💨</p>
      <Link href="/" className="btn-primary mt-8">back home →</Link>
    </div>
  );
}
