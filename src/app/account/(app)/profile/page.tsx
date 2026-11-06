import { Card, PageTitle } from "@/components/account/AccountUi";
import { requireAccount } from "@/lib/account";
import { saveProfile, signOut } from "../../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile" };

export default async function AccountProfile(props: PageProps<"/account/profile">) {
  const sp = await props.searchParams;
  const data = await requireAccount();
  return (
    <div className="max-w-2xl space-y-6">
      <PageTitle title="Profile" intro="How we greet you and the number we call about deliveries." />
      <Card>
        {sp.saved && <p className="mb-4 rounded-lg bg-green-soft px-3 py-2 text-sm text-green">Saved.</p>}
        {sp.sample && <p className="mb-4 rounded-lg bg-gold-soft px-3 py-2 text-sm">The sample account doesn&apos;t save changes.</p>}
        <form action={saveProfile} className="space-y-4">
          <div>
            <label htmlFor="name" className="label">Your name</label>
            <input id="name" name="name" defaultValue={data.name ?? ""} autoComplete="name" className="field" />
          </div>
          <div>
            <label htmlFor="phone" className="label">Phone</label>
            <input id="phone" name="phone" type="tel" defaultValue={data.phone ?? ""} autoComplete="tel" className="field" />
          </div>
          <div>
            <p className="label">Email</p>
            <p className="text-sm text-muted">{data.email}. To use a different email, sign in with it. Quotes are matched to the email they were sent from.</p>
          </div>
          <button className="btn-primary">Save</button>
        </form>
      </Card>
      <Card title="Sign out">
        <p className="text-sm text-muted">Signs you out on this device. Your events stay saved.</p>
        <form action={signOut} className="mt-4"><button className="btn-ghost btn-sm">Sign out</button></form>
      </Card>
    </div>
  );
}
