"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { formNumber } from "@/lib/format";
import { requireAdminProfile, requireProfile } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function withMessage(path: string, message: string, type: "ok" | "error" = "ok") {
  const params = new URLSearchParams({ message, type });
  return `${path}?${params.toString()}`;
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

// ADMIN ACTIONS

export async function createOrderAction(formData: FormData) {
  const { supabase } = await requireAdminProfile();
  const title = String(formData.get("title") ?? "");
  const amount = formNumber(formData.get("amount"));
  const commissionRate = formNumber(formData.get("commission_rate")) ?? 1.2;

  if (!title || !amount || amount <= 0) {
    redirect(withMessage("/admin/orders", "Invalid order details.", "error"));
  }

  const { error } = await supabase.rpc("admin_create_order", {
    p_title: title,
    p_amount: amount,
    p_commission_rate: commissionRate,
  });

  if (error) {
    redirect(withMessage("/admin/orders", error.message, "error"));
  }

  revalidatePath("/admin/orders");
  redirect(withMessage("/admin/orders", "Order created successfully."));
}

export async function assignOrderAction(formData: FormData) {
  const { supabase } = await requireAdminProfile();
  const orderId = String(formData.get("order_id") ?? "");
  const userId = String(formData.get("user_id") ?? "");

  if (!orderId || !userId) {
    redirect(withMessage("/admin/orders", "Missing required fields.", "error"));
  }

  const { error } = await supabase.rpc("admin_assign_order", {
    p_order_id: orderId,
    p_user_id: userId,
  });

  if (error) {
    redirect(withMessage("/admin/orders", error.message, "error"));
  }

  revalidatePath("/admin/orders");
  redirect(withMessage("/admin/orders", "Order assigned successfully."));
}

export async function setUserActivationAction(formData: FormData) {
  const { supabase } = await requireAdminProfile();
  const userId = String(formData.get("user_id") ?? "");
  const active = String(formData.get("active") ?? "") === "true";

  if (!userId) {
    redirect(withMessage("/admin/users", "Missing user id.", "error"));
  }

  const { error } = await supabase
    .from("users")
    .update({ is_activated: active })
    .eq("id", userId);

  if (error) {
    redirect(withMessage("/admin/users", error.message, "error"));
  }

  revalidatePath("/admin/users");
  redirect(withMessage("/admin/users", active ? "User activated." : "User deactivated."));
}

export async function reviewWithdrawalAction(formData: FormData) {
  const { supabase } = await requireAdminProfile();
  const withdrawalId = String(formData.get("withdrawal_id") ?? "");
  const status = String(formData.get("status") ?? "");

  if (!withdrawalId || !["approved", "rejected"].includes(status)) {
    redirect(withMessage("/admin/withdrawals", "Invalid withdrawal review.", "error"));
  }

  const { error } = await supabase.rpc("admin_review_withdrawal", {
    p_withdrawal_id: withdrawalId,
    p_status: status,
  });

  if (error) {
    redirect(withMessage("/admin/withdrawals", error.message, "error"));
  }

  revalidatePath("/admin/withdrawals");
  redirect(withMessage("/admin/withdrawals", `Withdrawal ${status}.`));
}

// USER ACTIONS

export async function processOrderAction(formData: FormData) {
  const { supabase } = await requireProfile();
  const orderId = String(formData.get("order_id") ?? "");

  if (!orderId) {
    redirect(withMessage("/orders", "Order not found.", "error"));
  }

  const { error } = await supabase.rpc("process_order", { p_order_id: orderId });

  if (error) {
    redirect(withMessage("/orders", error.message, "error"));
  }

  revalidatePath("/dashboard");
  revalidatePath("/orders");
  revalidatePath("/wallet");
  redirect(withMessage("/orders", "Order processed and commission credited."));
}

export async function requestWithdrawalAction(formData: FormData) {
  const { supabase } = await requireProfile();
  const amount = formNumber(formData.get("amount"));

  if (!amount || amount <= 0) {
    redirect(withMessage("/withdrawals", "Enter a valid withdrawal amount.", "error"));
  }

  const { error } = await supabase.rpc("request_withdrawal", { p_amount: amount });

  if (error) {
    redirect(withMessage("/withdrawals", error.message, "error"));
  }

  revalidatePath("/dashboard");
  revalidatePath("/wallet");
  revalidatePath("/withdrawals");
  redirect(withMessage("/withdrawals", "Withdrawal request submitted."));
}
