"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import ProductForm from "@/components/products/ProductForm"; // Adjust the import path based on your project structure

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = params?.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      const token = localStorage.getItem("storeToken");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error("Failed to load product");
        }

        const data = await res.json();
        setProduct(data?.data || data); // Adjust based on your API response structure (e.g., { data: product })
      } catch (err: any) {
        console.error("Fetch error:", err);
        setError(err.message || "Something went wrong");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    } else {
      setError("Invalid product ID");
      setIsLoading(false);
    }
  }, [id, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen text-xl">Loading product...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-center">
        <p className="text-xl text-red-600">{error}</p>
        <button
          onClick={() => router.push("/dashboard/products")}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go back to products
        </button>
      </div>
    );
  }

  return <ProductForm product={product} onSave={() => router.push("/dashboard/products")} />;
}