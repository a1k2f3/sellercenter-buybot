// src/app/(dashboard)/reports/page.tsx
"use client"
import { RevenueChart } from "@/components/dashboard/RevenueChart";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-4">Revenue Over Time</h2>
        <RevenueChart />
      </div>
    </div>
  );
}