"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ----------------------
// Type Definitions
// ----------------------
interface Category {
  _id: string;
  name: string;
  parentCategory?: { name: string } | null;
}

interface Tag {
  _id: string;
  name: string;
  color?: string;
}

interface Props {
  product?: any;
  onSave?: () => void;
}

// ----------------------
// Form Schema
// ----------------------
const schema = z.object({
  name: z.string().min(3, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Select a category"),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

// ----------------------
// Product Form Component
// ----------------------
export default function ProductForm({ product, onSave }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          name: product.name,
          description: product.description || "",
          price: Number(product.price),
          stock: Number(product.stock),
          sku: product.sku,
          category: product.category?._id || "",
          tags: product.tags?.map((t: any) => t._id) || [],
        }
      : {
          price: 0,
          stock: 0,
          tags: [],
        },
  });

  const watchedTags = watch("tags");

  // ----------------------
  // Sync selected tags with form
  // ----------------------
  useEffect(() => {
    setSelectedTags(watchedTags || []);
  }, [watchedTags]);

  // ----------------------
  // Fetch Categories
  // ----------------------
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCategories(data?.data || []); // <-- prevent undefined
      } catch {
        alert("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ----------------------
  // Fetch Tags
  // ----------------------
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTags(data?.data || []); // <-- prevent undefined
      } catch {
        alert("Failed to load tags");
      }
    };
    fetchTags();
  }, []);

  // ----------------------
  // Toggle Tag Selection
  // ----------------------
  const toggleTag = (tagId: string) => {
    const updated = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(updated);
    setValue("tags", updated);
  };

  // ----------------------
  // Image Handler
  // ----------------------
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + images.length > 4) return alert("Max 4 images allowed");
      setImages((prev) => [...prev, ...files]);
    }
  };

  // ----------------------
  // Submit Handler
  // ----------------------
  const onError = () => {
    alert("Please fill all required fields correctly");
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("storeToken");
      const storeId = localStorage.getItem("storeId");

      if (!token || !storeId) return router.push("/login");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", data.price.toString());
      formData.append("currency", "RS");
      formData.append("stock", data.stock.toString());
      formData.append("status", "active");
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("brand", storeId);

      data.tags?.forEach((t) => formData.append("tags", t));
      images.forEach((img) => formData.append("images", img));

      const url = product
        ? `http://localhost:5000/api/products/${product._id}`
        : `http://localhost:5000/api/products`;

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      alert(product ? "Product updated!" : "Product created!");
      onSave?.();
      router.push("/dashboard/products");
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onError)}
      className="max-w-5xl mx-auto bg-white p-10 rounded-3xl shadow-2xl space-y-8"
    >
      <h2 className="text-4xl font-bold">{product ? "Edit" : "Add New"} Product</h2>

      {/* Name & SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Product Name *</Label>
          <Input {...register("name")} placeholder="OnePlus 12 16GB/512GB" className="mt-2" />
          <p className="text-red-500 text-sm">{errors.name?.message}</p>
        </div>
        <div>
          <Label>SKU *</Label>
          <Input {...register("sku")} placeholder="OP12-16513" className="mt-2" />
          <p className="text-red-500 text-sm">{errors.sku?.message}</p>
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} rows={4} className="mt-2" placeholder="Product description..." />
      </div>

      {/* Price, Stock, Category */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Price (₹) *</Label>
          <Input type="number" {...register("price", { valueAsNumber: true })} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.price?.message}</p>
        </div>
        <div>
          <Label>Stock *</Label>
          <Input type="number" {...register("stock", { valueAsNumber: true })} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.stock?.message}</p>
        </div>
        <div>
          <Label>Category *</Label>
          <Select onValueChange={(v) => setValue("category", v)} defaultValue={watch("category")}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id}>
                  {cat.name} {cat.parentCategory ? `← ${cat.parentCategory.name}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-red-500 text-sm">{errors.category?.message}</p>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-3 mt-3">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag._id);
            return (

              <Badge>
  <button
    type="button"
    onClick={() => toggleTag(tag._id)}
    className={`cursor-pointer px-4 py-2 rounded-full transition-transform transform hover:scale-105 ${
      isSelected ? "text-green shadow-lg" : "border border-gray-300 text-gray-700"
    }`}
    style={{ backgroundColor: isSelected ? tag.color : undefined }}
  >
    {tag.name}
  </button>
</Badge>

            );
          })}
        </div>
      </div>

      {/* Images */}
      <div>
        <Label>Images (Max 4)</Label>
        <Input type="file" multiple accept="image/*" onChange={handleImageChange} className="mt-2" />
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(img)} alt="" className="w-full h-32 object-cover rounded-xl border" />
              <button
                type="button"
                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : product ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
