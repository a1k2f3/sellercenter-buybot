// src/components/layout/Sidebar.tsx
"use client";

import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Settings,
  BarChart3,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const menu = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/products", label: "Products", icon: Package },
  { href: "/dashboard/orders", label: "Orders", icon: ShoppingCart },
  { href: "/dashboard/customers", label: "Customers", icon: Users },
  { href: "/dashboard/marketing", label: "Marketing", icon: Tag },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [storeName, setStoreName] = useState<string>("");
  const [storeEmail, setStoreEmail] = useState<string>("");

  // Read from localStorage once on mount
  useEffect(() => {
    const name = localStorage.getItem("storeName") || "Unknown Store";
    const email = localStorage.getItem("storeEmail") || "no-email@store.com";

    setStoreName(name);
    setStoreEmail(email);
  }, []);

  const handleLogout = () => {
    // Clear everything
    localStorage.removeItem("store");
    localStorage.removeItem("storeToken");
    localStorage.removeItem("storeId");
    localStorage.removeItem("storeName");
    localStorage.removeItem("storeEmail");

    // Redirect to login
    window.location.href = "/auth/login";
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-gray-900">StoreAdmin</h1>
        <p className="text-sm font-medium text-gray-700 mt-3 truncate">{storeName}</p>
        <p className="text-xs text-gray-500 truncate">{storeEmail}</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}