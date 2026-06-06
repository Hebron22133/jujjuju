import type { Profile } from "@/lib/types";

export function ActivationNotice({ profile }: { profile: Profile }) {
  if (profile.is_activated) return null;

  return (
    <div className="notice">
      Your account is registered but not activated. Order processing and withdrawal requests are locked until an admin activates your account.
    </div>
  );
}
