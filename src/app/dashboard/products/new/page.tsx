// src/app/(dashboard)/products/new/page.tsx
"use client";
// import { ProductForm } from "@/components/products/ProductForm";
// import { ProductForm } from "@/components/products/ProductForm";
import { ProductForm } from "@/components/products/ProductForm";
import { useRouter } from "next/navigation";
export default function NewProductPage() {
  const router = useRouter();

  const handleSave = () => {
    // Save to localStorage
    router.push("/products");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* <h1 className="text-3xl font-bold">Add New Product</h1> */}
      <ProductForm onSave={handleSave} />
    </div>
  );
}