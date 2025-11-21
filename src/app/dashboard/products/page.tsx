// src/app/(dashboard)/products/page.tsx
"use client";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
// import { mockProducts } from "@/lib/mock-data/products";
import { Edit, Trash2 } from "lucide-react";
import { mockProducts } from "@/components/lib/mock-data/products";

const columns = [
  {
    accessorKey: "title",
    header: "Product",
    cell: ({ row }: any) => (
      <div>
        <p className="font-medium">{row.original.title}</p>
        <p className="text-sm text-gray-500">{row.original.sku}</p>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }: any) => `$${(row.original.price / 100).toFixed(2)}`,
  },
  {
    accessorKey: "stock",
    header: "Stock",
    cell: ({ row }: any) => (
      <span className={row.original.stock < 10 ? "text-red-600" : ""}>
        {row.original.stock}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }: any) => (
      <div className="flex gap-2">
        <Link href={`/products/${row.original.id}`}>
          <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
        </Link>
        <Button size="sm" variant="ghost" className="text-red-600">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    ),
  },
];

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>
      <DataTable columns={columns} data={mockProducts} />
    </div>
  );
}