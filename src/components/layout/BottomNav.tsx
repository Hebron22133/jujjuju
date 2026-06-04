"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Crown, CreditCard, ShoppingCart, User } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/vip", label: "VIP", icon: Crown },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/account", label: "My account", icon: User },
];

export function BottomNav() {
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
