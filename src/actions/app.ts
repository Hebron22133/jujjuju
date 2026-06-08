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

export async function processTaskAction(formData: FormData) {
  const { supabase, user } = await requireProfile();
  const taskId = String(formData.get("task_id") ?? "");

  if (!taskId || !user?.id) {
    redirect(withMessage("/orders", "Task not found.", "error"));
  }

  try {
    // Get task details
    const { data: task, error: taskError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();

    if (taskError || !task) {
      redirect(withMessage("/orders", "Task not found", "error"));
    }

    if (task.status === 'completed') {
      redirect(withMessage("/orders", "Task already completed", "error"));
    }

    // Calculate commission
    const commission = task.amount * (task.commission_rate / 100);

    // Update task status to completed
    const { error: updateTaskError } = await supabase
      .from('tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', taskId);

    if (updateTaskError) {
      redirect(withMessage("/orders", "Failed to update task", "error"));
    }

    // Get current user balance
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      redirect(withMessage("/orders", "User not found", "error"));
    }

    const newBalance = userData.balance + commission;

    // Update user balance
    const { error: updateBalanceError } = await supabase
      .from('users')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (updateBalanceError) {
      redirect(withMessage("/orders", "Failed to update balance", "error"));
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'order_commission',
        amount: commission,
        status: 'completed'
      });

    if (transactionError) {
      console.error('Transaction record error:', transactionError);
      // Don't fail - task is still completed even if this fails
    }

    revalidatePath("/dashboard");
    revalidatePath("/orders");
    revalidatePath("/wallet");
    redirect(withMessage("/orders", `Task completed! Commission ₦${commission.toLocaleString()} credited.`));
  } catch (error: any) {
    redirect(withMessage("/orders", error.message || "Failed to complete task", "error"));
  }
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
