import Link from "next/link";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/AdminNav";
import { site } from "@/lib/site";

// Back office shell: a staff bar and a sidebar around every /admin page.
// The password check lives in src/proxy.ts (pages) and in each Server Action.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg">
      <div className="bg-espresso" data-admin-chrome>
        <div className="mx-auto flex max-w-[96rem] items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
          <p className="font-serif text-lg text-ink">
            {site.name} <span className="text-muted italic">staff</span>
          </p>
          <Link href="/" className="text-sm text-gold">View website →</Link>
        </div>
      </div>
      <div data-admin-chrome><AdminMobileNav /></div>
      <div className="mx-auto flex max-w-[96rem]">
        <aside className="hidden w-60 shrink-0 border-r border-line px-3 py-8 lg:block">
          <div className="sticky top-24">
            <AdminSidebar />
          </div>
        </aside>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
