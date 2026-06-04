import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile?.level_id) {
    return (
      <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto" }}>
        <h1>Account Not Activated</h1>
        <p>Your account is awaiting admin activation. Please check back later.</p>
      </div>
    );
  }

  // Get level info
  const { data: level } = await supabase
    .from("levels")
    .select("*")
    .eq("id", profile.level_id)
    .single();

  // Get progress
  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("level_id", profile.level_id)
    .single();

  // Get today's completion
  const today = new Date().toISOString().split("T")[0];
  const { data: todayCompletion } = await supabase
    .from("daily_completions")
    .select("*")
    .eq("user_id", user.id)
    .eq("level_id", profile.level_id)
    .gte("completion_date", today)
    .maybeSingle();

  const daysRemaining = level ? level.duration_days - (progress?.days_completed || 0) : 0;
  const canWithdraw = progress && level && progress.days_completed >= level.duration_days;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>User Dashboard</h1>

      {/* Balances */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div style={{ border: "1px solid #ddd", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>Main Balance</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>₦{(profile?.main_balance || 0).toLocaleString()}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>Used to access tasks (not withdrawable)</p>
        </div>
        <div style={{ border: "1px solid #ddd", padding: "20px", backgroundColor: "#f9f9f9" }}>
          <h3>Commission Balance</h3>
          <p style={{ fontSize: "28px", fontWeight: "bold", color: "#27ae60" }}>₦{(profile?.commission_balance || 0).toLocaleString()}</p>
          <p style={{ fontSize: "12px", color: "#666" }}>Withdrawable earnings</p>
        </div>
      </div>

      {/* Level Info */}
      <div style={{ border: "1px solid #ddd", padding: "20px", marginBottom: "30px" }}>
        <h2>Level {profile?.level_id} Progress</h2>
        <p>Daily Commission: <strong>₦{level?.daily_commission.toLocaleString()}</strong></p>
        <p>Days Completed: <strong>{progress?.days_completed || 0} / {level?.duration_days}</strong></p>
        <p>Total Earned This Level: <strong>₦{(progress?.total_earned || 0).toLocaleString()}</strong></p>
        <p>Days Remaining: <strong>{daysRemaining}</strong></p>

        {/* Progress Bar */}
        <div style={{ marginTop: "15px", backgroundColor: "#e0e0e0", height: "20px", borderRadius: "5px", overflow: "hidden" }}>
          <div
            style={{
              backgroundColor: "#27ae60",
              height: "100%",
              width: `${((progress?.days_completed || 0) / (level?.duration_days || 1)) * 100}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <form action="/api/user/complete-task" method="POST">
          <button
            type="submit"
            disabled={!!todayCompletion}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: todayCompletion ? "#ccc" : "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: todayCompletion ? "not-allowed" : "pointer",
              fontSize: "16px",
            }}
          >
            {todayCompletion ? "Already Completed Today" : "Complete Today's Task"}
          </button>
        </form>

        <form action="/api/user/request-withdrawal" method="POST">
          <button
            type="submit"
            disabled={!canWithdraw || (profile?.commission_balance || 0) === 0}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: canWithdraw && (profile?.commission_balance || 0) > 0 ? "#27ae60" : "#ccc",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: canWithdraw && (profile?.commission_balance || 0) > 0 ? "pointer" : "not-allowed",
              fontSize: "16px",
            }}
          >
            {!canWithdraw ? `${daysRemaining} days remaining` : "Request Withdrawal"}
          </button>
        </form>
      </div>

      {/* Upgrade to next level */}
      {profile?.level_id && profile.level_id < 5 && (
        <div style={{ border: "1px solid #ffd700", padding: "20px", marginTop: "30px", backgroundColor: "#fffacd" }}>
          <h3>Ready for Level {profile.level_id + 1}?</h3>
          <p>Upgrade cost: ₦{level?.entry_amount.toLocaleString()}</p>
          <p>New daily commission: ₦{((level?.daily_commission || 0) * 2).toLocaleString()}</p>
          <form action="/api/user/upgrade-level" method="POST">
            <input type="hidden" name="new_level_id" value={profile.level_id + 1} />
            <button
              type="submit"
              disabled={(profile?.main_balance || 0) < (level?.entry_amount || 0)}
              style={{
                padding: "10px 20px",
                backgroundColor: (profile?.main_balance || 0) >= (level?.entry_amount || 0) ? "#ffd700" : "#ccc",
                border: "none",
                cursor: (profile?.main_balance || 0) >= (level?.entry_amount || 0) ? "pointer" : "not-allowed",
              }}
            >
              Upgrade Now
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
