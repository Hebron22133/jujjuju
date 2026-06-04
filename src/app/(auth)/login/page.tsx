import { AuthShell } from "@/components/layout/AuthShell";
import { AuthForm } from "@/components/ui/AuthForm";

export default function LoginPage() {
  return (
    <AuthShell title="Log in to your account" copy="Access your Jumia account and manage your orders and balance.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
