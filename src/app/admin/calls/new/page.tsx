import type { Metadata } from "next";
import Link from "@/components/Link";
import { AdminHeader } from "@/components/admin/AdminUi";
import { CallScript } from "@/components/admin/CallScript";
import { createCallLead } from "../actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "New phone call", robots: { index: false } };

export default async function NewCallPage(props: PageProps<"/admin/calls/new">) {
  const sp = await props.searchParams;
  return (
    <div className="container-x py-10">
      <Link href="/admin/calls" className="text-sm text-accent">← Call list</Link>
      <div className="mt-3">
        <AdminHeader
          group="Daily"
          title="New phone call"
          intro="Someone called us. Fill this in while you talk, top to bottom. Saving adds them to the pipeline as a new customer, marked Contacted, with the call on their timeline. A name or phone number is enough to save."
        />
      </div>
      {sp.error === "contact" && (
        <p role="alert" className="mt-6 rounded-xl bg-rose-soft px-4 py-3 text-sm text-rose">
          Add at least a name, phone number or email so we can find them again.
        </p>
      )}
      <CallScript action={createCallLead} prefilled={{}} submissionId={crypto.randomUUID()} saveLabel="Save call" />
    </div>
  );
}
