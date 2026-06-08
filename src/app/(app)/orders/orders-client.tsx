'use client'

import React, { useState, useEffect, useRef } from 'react'
import { processOrderAction } from "@/actions/app";
import { ActivationNotice } from "@/components/ui/ActivationNotice";
import { Message } from "@/components/ui/Message";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { money, shortDate } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Loader } from 'lucide-react'

interface Profile {
  id: string;
  balance: number;
  is_activated: boolean;
  tier_level: number;
  level_id?: number;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  amount: number;
  commission_rate: number;
  status: string;
  level_id: number;
  created_at: string;
  completed_at?: string;
}

export default function OrdersClient({
  initialProfile,
  initialOrders,
  userId,
  message,
  type
}: {
  initialProfile: Profile;
  initialOrders: Order[];
  userId: string;
  message?: string;
  type?: string;
}) {
  const [profile, setProfile] = useState<Profile>(initialProfile);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('')
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLastUpdated(new Date());
    fetchData();

    // Polling every 3 seconds when not activated
    if (!profile.is_activated) {
      pollingIntervalRef.current = setInterval(() => {
        fetchData();
      }, 3000);
    } else {
      // If activated, clear the interval and fetch once more
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [profile.is_activated, userId]);

  const fetchData = async () => {
    try {
      const profileRes = await fetch(`/api/user/profile?id=${userId}`);
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setProfile(profileData);
      }

      // Fetch orders and tasks if activated
      const currentProfile = profile;
      if (currentProfile.is_activated || profileRes.ok) {
        const ordersRes = await fetch(`/api/user/orders?id=${userId}`);
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setOrders(ordersData.orders || []);
        }

        // Fetch tasks assigned to user's level
        const tasksRes = await fetch(`/api/user/tasks?id=${userId}`);
        if (tasksRes.ok) {
          const tasksData = await tasksRes.json();
          setTasks(tasksData.tasks || []);
        }
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleProcessTask = async (taskId: string) => {
    setProcessingId(taskId);
    setSuccessMessage('');
    try {
      const response = await fetch('/api/user/process-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: taskId, user_id: userId })
      });

      const data = await response.json();

      if (!response.ok) {
        setSuccessMessage(`❌ Error: ${data.error}`);
        setProcessingId(null);
        return;
      }

      setSuccessMessage(`✅ Task completed! Commission ₦${data.commission.toLocaleString('en-NG')} credited.`);
      setProcessingId(null);
      
      // Refresh data after 1.5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        fetchData();
      }, 1500);
    } catch (error: any) {
      setSuccessMessage(`❌ Error: ${error.message}`);
      setProcessingId(null);
    }
  };

  // Show activation notice when polling (not activated)
  if (!profile.is_activated) {
    return (
      <>
        <Message message={message} type={type} />
        <ActivationNotice profile={profile} />
        
        {/* Auto-refresh indicator */}
        <div style={{
          padding: "12px",
          backgroundColor: "#e3f2fd",
          border: "1px solid #90caf9",
          borderRadius: "5px",
          fontSize: "12px",
          color: "#1565c0",
          marginBottom: "20px"
        }}>
          <span>🔄 Page auto-refreshes every 3 seconds</span>
          {lastUpdated && (
            <p style={{ margin: "5px 0 0 0", fontSize: "11px" }}>
              Last checked: {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </div>
      </>
    );
  }

  const assigned = (orders ?? []).filter((o) => o.status === "assigned");
  const completed = (orders ?? []).filter((o) => o.status === "completed");
  const assignedTasks = (tasks ?? []).filter((t) => t.status === "assigned");
  const completedTasks = (tasks ?? []).filter((t) => t.status === "completed");

  const calculateCommission = (amount: number, rate: number) => amount * (rate / 100);

  return (
    <>
      <Message message={message} type={type} />
      <ActivationNotice profile={profile} />

      <section className="panel">
        <div className="panel-title">Active Tasks ({assigned.length + assignedTasks.length})</div>
        <div className="list">
          {assigned.length + assignedTasks.length > 0 ? (
            <>
              {/* Level-based tasks */}
              {assignedTasks.map((task) => (
                <div className="list-item" key={task.id}>
                  <div className="list-line">
                    <strong>{task.title || "Task"}</strong>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="tiny">
                    Amount: {money(task.amount)} | Commission: {task.commission_rate}% ({money(calculateCommission(task.amount, task.commission_rate))})
                  </div>
                  <div className="tiny">Level {task.level_id} | Posted: {shortDate(task.created_at)}</div>
                  <button 
                    className="button small" 
                    onClick={() => handleProcessTask(task.id)}
                    disabled={!profile.is_activated || processingId === task.id}
                    style={{ marginTop: "0.5rem" }}
                  >
                    {processingId === task.id ? <Loader className="inline" size={14} /> : "Process Task"}
                  </button>
                </div>
              ))}
              {/* Legacy orders */}
              {assigned.map((order) => (
                <div className="list-item" key={order.id}>
                  <div className="list-line">
                    <strong>{order.title || "Order"}</strong>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="tiny">
                    Amount: {money(order.amount)} | Commission: {order.commission_rate}% ({money(calculateCommission(order.amount, order.commission_rate))})
                  </div>
                  <div className="tiny">Posted: {shortDate(order.created_at)}</div>
                  <form action={processOrderAction} style={{ marginTop: "0.5rem" }}>
                    <input type="hidden" name="order_id" value={order.id} />
                    <button className="button small" type="submit" disabled={!profile.is_activated}>
                      Process Order
                    </button>
                  </form>
                </div>
              ))}
            </>
          ) : (
            <p className="tiny">
              {profile.is_activated
                ? "No tasks assigned to you yet."
                : "Account must be activated to receive tasks."}
            </p>
          )}
        </div>
      </section>

      <section className="panel">
        <div className="panel-title">Completed Tasks ({completed.length + completedTasks.length})</div>
        <div className="list">
          {completed.length + completedTasks.length > 0 ? (
            <>
              {/* Level-based completed tasks */}
              {completedTasks.slice(0, 20).map((task) => (
                <div className="list-item" key={task.id}>
                  <div className="list-line">
                    <strong>{task.title || "Task"}</strong>
                    <StatusBadge status={task.status} />
                  </div>
                  <div className="tiny">
                    Amount: {money(task.amount)} | Earned: {money(calculateCommission(task.amount, task.commission_rate))}
                  </div>
                  <div className="tiny">Level {task.level_id} | Completed: {shortDate(task.completed_at)}</div>
                </div>
              ))}
              {/* Legacy completed orders */}
              {completed.slice(0, 20).map((order) => (
                <div className="list-item" key={order.id}>
                  <div className="list-line">
                    <strong>{order.title || "Order"}</strong>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="tiny">
                    Amount: {money(order.amount)} | Earned: {money(calculateCommission(order.amount, order.commission_rate))}
                  </div>
                  <div className="tiny">Completed: {shortDate(order.completed_at)}</div>
                </div>
              ))}
            </>
          ) : (
            <p className="tiny">No completed tasks yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
