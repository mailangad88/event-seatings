import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/account/SignInForm";
import { Icon } from "@/components/ui/Icon";
import { getSession, signInOpen } from "@/lib/account-auth";
import { sceneFor } from "@/lib/scenes";
import { site } from "@/lib/site";
import { viewSample } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Sign in to your account",
  description: `Sign in to see your ${site.name} events, quotes, delivery times, payments and messages.`,
  robots: { index: false, follow: true },
};

const inside = [
  { icon: "truck" as const, text: "Your order, with each rental company's part and delivery times" },
  { icon: "wallet" as const, text: "What's paid and what's still to pay" },
  { icon: "chat" as const, text: "Messages with your coordinator" },
  { icon: "heart" as const, text: "Your event plans and saved ideas on any device" },
];

export default async function SignIn(props: PageProps<"/account/sign-in">) {
  if (await getSession()) redirect("/account");
  const sp = await props.searchParams;
  const open = signInOpen();
  const scene = sceneFor("account-sign-in");
  const linkNote = sp.link === "used" ? "That link was already used. Ask for a new one below." : sp.link === "expired" ? "That link has expired. Ask for a new one below." : undefined;

  return (
    <div className="container-x py-10 md:py-16">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <section className="card p-6 sm:p-10">
          <p className="eyebrow">Your account</p>
          <h1 className="display-2 mt-2">Sign in</h1>
          <p className="mt-3 text-muted">No password needed. We email you a link that signs you in.</p>
          {linkNote && <p role="alert" className="mt-4 rounded-lg bg-amber-soft px-3 py-2 text-sm text-amber">{linkNote}</p>}
          <div className="mt-6">
            {open ? (
              <SignInForm />
            ) : (
              <p className="rounded-xl border border-line p-4 text-sm text-muted">
                Online accounts open soon. Until then your coordinator sends updates by email
                {site.phone ? <> or call <a href={`tel:${site.phone}`} className="link">{site.phone}</a></> : null}. You can still{" "}
                <Link href="/my-events" className="link">plan your event</Link> on this device.
              </p>
            )}
          </div>
          <div className="mt-8 border-t border-line pt-6">
            <p className="text-sm text-muted">Want to look around first?</p>
            <form action={viewSample} className="mt-3">
              <button className="btn-ghost btn-sm">See a sample account</button>
            </form>
          </div>
        </section>
        <section className="relative overflow-hidden rounded-2xl bg-espresso p-6 sm:p-10">
          <Image src={scene.src} alt={scene.alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover opacity-30" />
          <div className="relative">
            <h2 className="display-3 text-ink">Everything for your event in one place</h2>
            <ul className="mt-6 space-y-4">
              {inside.map((i) => (
                <li key={i.text} className="flex items-start gap-3 text-ink">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface-2 text-gold"><Icon name={i.icon} size={18} /></span>
                  <span className="pt-2 text-sm">{i.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-8 text-sm text-muted">New here? <Link href="/quote" className="text-gold underline underline-offset-2">Start a quote</Link> and your account is ready when it arrives.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
