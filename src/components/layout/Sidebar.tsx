// src/components/layout/Sidebar.tsx
"use client";
import { Home, Package, ShoppingCart, Users, Tag, Settings, BarChart3, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/cn";
import { useAuth } from "../context/AuthContext";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["ADMIN", "MANAGER", "SUPPORT"] },
  { href: "/dashboard/products", label: "Products", icon: Package, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart, roles: ["ADMIN", "MANAGER", "SUPPORT"] },
  { href: "/dashboard/customers", label: "Customers", icon: Users, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/marketing", label: "Marketing", icon: Tag, roles: ["ADMIN"] },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3, roles: ["ADMIN", "MANAGER"] },
  { href: "/dashboard/settings", label: "Settings", icon: Settings, roles: ["ADMIN"] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const filteredMenu = menu.filter(item => 
    item.roles.includes(user?.role || "VIEWER")
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">StoreAdmin</h1>
      </div>
      <nav className="px-3 space-y-1">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="absolute bottom-0 w-full p-3 border-t">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}