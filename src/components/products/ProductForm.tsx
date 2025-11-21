// src/components/products/ProductForm.tsx
"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import { Product } from "../types/index";

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  sku: z.string().min(1),
  category: z.string(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  product?: Product;
  onSave: () => void;
}

export function ProductForm({ product, onSave }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          title: product.title,
          slug: product.slug,
          description: product.description,
          price: product.price / 100,
          stock: product.stock,
          sku: product.sku,
          category: product.category,
        }
      : { price: 0, stock: 0 },
  });

  const onSubmit = (data: FormData) => {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const newProduct = {
      ...data,
      id: product?.id || crypto.randomUUID(),
      price: Math.round(data.price * 100),
      images: product?.images || [],
      createdAt: product?.createdAt || new Date().toISOString(),
    };

    const updated = product
      ? products.map((p: any) => (p.id === product.id ? newProduct : p))
      : [...products, newProduct];

    localStorage.setItem("products", JSON.stringify(updated));
    onSave();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Title</Label>
          <Input {...register("title")} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <Label>SKU</Label>
          <Input {...register("sku")} />
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} rows={4} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Price ($)</Label>
          <Input type="number" step="0.01" {...register("price", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Stock</Label>
          <Input type="number" {...register("stock", { valueAsNumber: true })} />
        </div>
        <div>
          <Label>Category</Label>
          <Input {...register("category")} />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={() => history.back()}>
          Cancel
        </Button>
        <Button type="submit">{product ? "Update" : "Create"} Product</Button>
      </div>
    </form>
  );
}