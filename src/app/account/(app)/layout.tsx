import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSidebar, AccountTabs } from "@/components/account/AccountNav";
import { Icon } from "@/components/ui/Icon";
import { currentAccount, firstName } from "@/lib/account";
import { signOut } from "../actions";

export const metadata: Metadata = {
  title: { default: "Your account", template: "%s · Your account" },
  robots: { index: false, follow: false },
};

// The renter's account shell: a dark sidebar with their sections, and the page on the right.
export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const data = await currentAccount();
  if (!data) redirect("/account/sign-in");
  const unread = data.events.reduce((n, e) => n + e.unread, 0);
  const needs = data.events.reduce((n, e) => n + e.needs.length, 0);
  const initials = (data.name ?? data.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <div className="bg-bg">
      {data.sample && (
        <div className="bg-gold-soft">
          <p className="container-x flex flex-wrap items-center justify-between gap-2 py-2 text-sm text-ink">
            <span>This is a sample account with example events. Nothing here is a real order.</span>
            <form action={signOut}><button className="font-semibold text-accent underline underline-offset-2">Leave sample</button></form>
          </p>
        </div>
      )}
      <div className="mx-auto flex max-w-[96rem] gap-6 px-4 py-6 sm:px-6 lg:py-8">
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-24 flex min-h-[calc(100vh-8rem)] flex-col rounded-2xl bg-espresso p-4 shadow-lift">
            <p className="px-3 pt-2 text-xs font-semibold tracking-[0.18em] text-muted uppercase">Your account</p>
            <div className="mt-4 flex-1">
              <AccountSidebar unread={unread} needs={needs} />
            </div>
            <Link href="/quote" className="btn-primary btn-sm mt-6 w-full">
              <Icon name="plus" size={16} /> Plan another event
            </Link>
            <div className="mt-4 flex items-center gap-3 border-t border-line px-1 pt-4">
              <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-ink">{initials || "?"}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">{data.name ?? "Welcome"}</p>
                <p className="truncate text-xs text-muted">{data.email}</p>
              </div>
              <form action={signOut}>
                <button className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-ink" title="Sign out" aria-label="Sign out">
                  <Icon name="arrow" size={18} />
                </button>
              </form>
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <p className="text-sm text-muted">Signed in as <span className="font-medium text-ink">{firstName(data.name) ?? data.email}</span></p>
            <form action={signOut}><button className="text-sm font-semibold text-accent">Sign out</button></form>
          </div>
          <div className="mb-6 lg:hidden"><AccountTabs unread={unread} needs={needs} /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
