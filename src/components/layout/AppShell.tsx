import { signOutAction } from "@/actions/app";
import type { Profile } from "@/lib/types";
import { BottomNav } from "./BottomNav";

export function AppShell({
  children,
  profile,
}: {
  children: React.ReactNode;
  profile: Profile;
}) {
  return (
    <div className="mobile-frame">
      <header className="top-bar">
        <div className="top-title">Jumia</div>
        <form action={signOutAction}>
          <button className="sign-out" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <main className="app-main">{children}</main>
      <BottomNav isAdmin={profile.is_admin} />
    </div>
  );
}
