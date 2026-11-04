import type { Metadata } from "next";
import Link from "next/link";
import { readLoginToken } from "@/lib/account-auth";
import { confirmLogin } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

// Landing page for the emailed link. Signing in takes a button press, so email scanners that open
// links can't use up the one-time link before the renter does.
export default async function Verify(props: PageProps<"/account/verify">) {
  const sp = await props.searchParams;
  const t = typeof sp.t === "string" ? sp.t : "";
  const p = readLoginToken(t);
  return (
    <div className="container-narrow py-16 md:py-24">
      <section className="card mx-auto max-w-md p-8 text-center">
        {p ? (
          <>
            <h1 className="display-3">Sign in to your account</h1>
            <p className="mt-2 text-sm text-muted">Signing in as <span className="font-medium text-ink">{p.e}</span></p>
            <form action={confirmLogin} className="mt-6">
              <input type="hidden" name="t" value={t} />
              <button className="btn-primary w-full">Sign me in</button>
            </form>
          </>
        ) : (
          <>
            <h1 className="display-3">This link has expired</h1>
            <p className="mt-2 text-sm text-muted">Sign-in links work for 30 minutes. Ask for a new one and it will arrive in a minute.</p>
            <Link href="/account/sign-in" className="btn-primary mt-6 w-full">Get a new link</Link>
          </>
        )}
      </section>
    </div>
  );
}
