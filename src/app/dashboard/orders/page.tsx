// src/app/(dashboard)/orders/page.tsx
"use client";
import { DataTable } from "@/components/ui/data-table";
import { mockOrders } from "@/components/lib/mock-data/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import Link from "next/link";

const columns = [
  { accessorKey: "id", header: "Order ID" },
  { accessorKey: "customer", header: "Customer" },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }: any) => `$${(row.original.total / 100).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: any) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <Link href={`/orders/${row.original.id}`}>
        <button className="text-blue-600 hover:underline text-sm">View</button>
      </Link>
    ),
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <DataTable columns={columns} data={mockOrders} />
    </div>
  );
}