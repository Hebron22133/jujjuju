import { AuthShell } from "@/components/layout/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" copy="Start earning with Jumia today. You'll receive ₦2,000 in welcome credits to begin accepting orders.">
      <AuthForm mode="signup" />
    </AuthShell>
  );
}
