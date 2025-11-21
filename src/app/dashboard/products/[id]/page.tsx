// src/app/(dashboard)/products/[id]/page.tsx
"use client";
import { mockProducts } from "@/components/lib/mock-data/products";
import { ProductForm } from "@/components/products/ProductForm";
// import { mockProducts } from "@/lib/mock-data/products";
import { notFound } from "next/navigation";

export default function EditProductPage({ params }: { params: { id: string } }) {
  const product = mockProducts.find(p => p.id === params.id);
  if (!product) notFound();

  const handleSave = () => {
    // Update localStorage
    window.location.href = "/products";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Edit Product</h1>
      <ProductForm product={product} onSave={handleSave} />
    </div>
  );
}