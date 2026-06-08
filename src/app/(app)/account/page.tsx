import { requireProfile } from "@/lib/auth";
import AccountClient from "./account-client";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const { user, profile } = await requireProfile();

  return <AccountClient initialProfile={profile} initialUser={user} userId={profile.id} />;
}

