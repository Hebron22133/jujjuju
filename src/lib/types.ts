export type Profile = {
  id: string;
  balance: number;
  is_activated: boolean;
  is_admin: boolean;
  tier_level: number;
  created_at: string;
};

export type Transaction = {
  id: string;
  user_id: string;
  type: "signup_bonus" | "order_commission" | "withdrawal" | "withdrawal_refund";
  amount: number;
  status: "pending" | "completed" | "rejected";
  created_at: string;
};

export type Order = {
  id: string;
  title: string | null;
  amount: number;
  commission_rate: number;
  assigned_to: string | null;
  status: "pending" | "assigned" | "completed" | "cancelled";
  created_at: string;
  completed_at: string | null;
};

export type Withdrawal = {
  id: string;
  user_id: string;
  transaction_id: string | null;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  reviewed_at: string | null;
};

export type Level = {
  id: number;
  name: string;
  entry_amount: number;
  task_access_amount: number;
  daily_commission: number;
  duration_days: number;
  created_at: string;
};

export type UserProgress = {
  id: string;
  user_id: string;
  level_id: number;
  start_date: string;
  days_completed: number;
  total_earned: number;
  completed_at: string | null;
  created_at: string;
};

export type DailyCompletion = {
  id: string;
  user_id: string;
  level_id: number;
  completion_date: string;
  commission_earned: number;
  created_at: string;
};

export type Task = {
  id: string;
  level_id: number;
  title: string;
  description: string;
  status: "active" | "inactive";
  created_at: string;
};
