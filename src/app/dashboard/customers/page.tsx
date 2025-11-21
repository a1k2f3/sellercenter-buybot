// src/app/(dashboard)/customers/page.tsx
"use client";
import { DataTable } from "@/components/ui/data-table";
import { mockCustomers } from "@/components/lib/mock-data/customers";

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "orders", header: "Orders" },
  { accessorKey: "spent", header: "Total Spent", cell: ({ row }: any) => `$${row.original.spent}` },
];

export default function CustomersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customers</h1>
      <DataTable columns={columns} data={mockCustomers} />
    </div>
  );
}