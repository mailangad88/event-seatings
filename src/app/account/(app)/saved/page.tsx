import { PageTitle } from "@/components/account/AccountUi";
import { SavedSync } from "@/components/account/SavedSync";
import { requireAccount } from "@/lib/account";

export const dynamic = "force-dynamic";
export const metadata = { title: "Plans and ideas" };

export default async function AccountSaved() {
  const data = await requireAccount();
  return (
    <div className="space-y-6">
      <PageTitle title="Plans and ideas" intro="Your My events plans and the photos you saved with the heart button, kept with your account." />
      <SavedSync sample={data.sample} email={data.email} />
    </div>
  );
}
