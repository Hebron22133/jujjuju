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
