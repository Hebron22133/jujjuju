"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, ShieldCheck, Wallet, WalletCards } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/orders", label: "Orders", icon: ClipboardList },
  { href: "/wallet", label: "Wallet", icon: Wallet },
  { href: "/withdrawals", label: "Cashout", icon: WalletCards },
  { href: "/admin", label: "Admin", icon: ShieldCheck },
];

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {items
        .filter((item) => isAdmin || item.href !== "/admin")
        .map((item) => {
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
