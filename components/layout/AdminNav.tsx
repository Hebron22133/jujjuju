"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Users, ClipboardList, WalletCards, Home } from "lucide-react";

const items = [
  { href: "/admin/dashboard", label: "Dashboard", icon: Home },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/withdrawals", label: "Cashouts", icon: WalletCards },
  { href: "/dashboard", label: "User Mode", icon: BarChart3 },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items.map((item) => {
        const Icon = item.icon;
        const active = pathname === item.href;
        return (
          <Link className={`nav-item ${active ? "active" : ""}`} href={item.href} key={item.href}>
            <Icon aria-hidden />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
