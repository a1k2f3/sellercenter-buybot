// src/app/(dashboard)/products/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";

interface Product {
  id: string;
  title: string;
  sku?: string;
  price: number;
  discountPrice?: number;     // ← added
  stock: number;
  imageUrl?: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const columns: ColumnDef<Product>[] = [
    // Product Image
    {
      id: "image",
      header: "",
      cell: ({ row }) => {
        const imageUrl = row.original.imageUrl;
        return (
          <div className="relative w-12 h-12 flex-shrink-0">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={row.original.title}
                width={48}
                height={48}
                className="rounded-md object-cover border"
                unoptimized
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 border-2 border-dashed rounded-md" />
            )}
          </div>
        );
      },
    },

    // Product Title + SKU
    {
      accessorKey: "title",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium text-base">{row.original.title}</p>
            {row.original.sku && (
              <p className="text-sm text-muted-foreground">SKU: {row.original.sku}</p>
            )}
          </div>
        </div>
      ),
    },

    // Price (with discount support)
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => {
        const { price, discountPrice } = row.original;
        const hasDiscount = discountPrice !== undefined && discountPrice > 0 && discountPrice < price;

        return (
          <div className="flex flex-col">
            {hasDiscount ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  Rs. {price.toLocaleString()}
                </span>
                <span className="font-semibold text-red-600">
                  Rs. {discountPrice.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="font-semibold">
                Rs. {price.toLocaleString()}
              </span>
            )}
          </div>
        );
      },
    },

    // Stock with visual indicators
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.stock;
        const isLow = stock > 0 && stock < 50;
        const isOut = stock === 0;

        return (
          <span
            className={`font-medium ${
              isOut
                ? "text-red-600"
                : isLow
                ? "text-orange-600"
                : "text-green-600"
            }`}
          >
            {stock} {isOut && "(Out of stock)"}
            {isLow && stock > 0 && " (Low)"}
          </span>
        );
      },
    },

    // Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const product = row.original;

        const handleDelete = () => {
          toast.error(`Delete "${product.title}"?`, {
            description: "This action cannot be undone.",
            duration: 8000,
            action: {
              label: "Confirm",
              onClick: async () => {
                try {
                  const token = localStorage.getItem("token");

                  const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/delete/${product.id}`,
                    {
                      method: "DELETE",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                    }
                  );

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || "Failed to delete product");
                  }

                  setProducts((prev) => prev.filter((p) => p.id !== product.id));
                  toast.success("Product deleted successfully!");
                } catch (error: any) {
                  console.error("Delete error:", error);
                  toast.error("Failed to delete product", {
                    description: error.message || "Please try again",
                  });
                }
              },
            },
            cancel: {
              label: "Cancel",
              onClick: () => {},
            },
          });
        };

        return (
          <div className="flex items-center gap-1">
            <Link href={`/dashboard/products/${row.original.id}`}>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      const storeId = localStorage.getItem("storeId");
      const token = localStorage.getItem("storeToken");

      if (!storeId || !token) {
        console.warn("Missing storeId or token");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/profile?storeId=${storeId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Failed to fetch store profile");

        const data = await res.json();
console.log("Fetched products:", data.products);
        const formattedProducts: Product[] = (data.products || []).map((p: any) => ({
          id: p._id,
          title: p.name,
          sku: p.sku || undefined,
          price: p.price,
          discountPrice: p.discountPrice || undefined,     // ← added mapping
          stock: p.stock,
          imageUrl: p.images?.[0]?.url || undefined,
        }));

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-lg text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Products</h1>
        <Link href="/dashboard/products/new">
          <Button>Add Product</Button>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-xl text-muted-foreground mb-4">
            No products added yet
          </p>
          <Link href="/dashboard/products/new">
            <Button>Add your first product</Button>
          </Link>
        </div>
      ) : (
        <DataTable columns={columns} data={products} />
      )}
    </div>
  );
}