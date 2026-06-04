"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Zap, CheckSquare, CreditCard, Wallet } from "lucide-react";

const adminItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, desc: "System overview" },
  { href: "/admin/agents", label: "Agent Management", icon: Users, desc: "View & manage agents" },
  { href: "/admin/tasks", label: "Task Management", icon: Zap, desc: "Create & manage tasks" },
  { href: "/admin/submissions", label: "Submissions", icon: CheckSquare, desc: "Review submissions" },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: CreditCard, desc: "Approval requests" },
  { href: "/admin/wallet", label: "Wallet Control", icon: Wallet, desc: "Adjust balances" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <h1 className="admin-logo">Admin Panel</h1>
        <p style={{ fontSize: "11px", color: "#999", margin: "4px 0 0 0" }}>System Administration</p>
      </div>

      <nav className="admin-nav">
        {adminItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              className={`admin-nav-item ${active ? "active" : ""}`}
              href={item.href}
              key={item.href}
              title={item.desc}
            >
              <Icon size={20} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: "500" }}>{item.label}</span>
                <span style={{ fontSize: "11px", color: "#999" }}>{item.desc}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
