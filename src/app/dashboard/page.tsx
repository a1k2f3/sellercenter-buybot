// src/app/(dashboard)/page.tsx
"use client";
import { KPI } from "@/components/dashboard/KPI";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { dashboardStats } from "@/components/lib/mock-data/dashboard";

export default function Dashboard() {
  const stats = dashboardStats;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI title="Total Revenue" value={`$${stats.revenue.toLocaleString()}`} change="+12.5%" positive />
        <KPI title="Orders Today" value={stats.ordersToday.toString()} change="+8%" positive />
        <KPI title="Pending" value={stats.pending.toString()} change="-3" />
        <KPI title="Low Stock" value={stats.lowStock.toString()} change="+2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <RecentOrders />
      </div>
    </div>
  );
}