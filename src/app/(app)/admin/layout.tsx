import { AdminShell } from "@/components/layout/AdminShell";
import { requireAdminProfile } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await requireAdminProfile();

  return <AdminShell profile={profile}>{children}</AdminShell>;
}
