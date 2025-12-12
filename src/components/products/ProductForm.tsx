// src/components/products/ProductForm.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const schema = z.object({
  name: z.string().min(3, "Product name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Please select a category"),
  tags: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof schema>;

interface Category {
  _id: string;
  id: string;
  name: string;
  parentCategory?: { name: string };
}

interface Tag {
  _id: string;
  id: string;
  name: string;
  color?: string;
}

interface Props {
  product?: any;
  onSave?: () => void;
}

export function ProductForm({ product, onSave }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTags, setLoadingTags] = useState(true);

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
          price: product.price,
          stock: product.stock,
          sku: product.sku,
          category: product.category?._id || product.category,
          tags: product.tags?.map((t: any) => t._id || t) || [],
        }
      : {
          price: 0,
          stock: 0,
          tags: [],
        },
  });

  // Watch selected tags
  const watchedTags = watch("tags");

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCategories(data.data || data);
      } catch (err) {
        alert("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch tags
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTags(data.data || data);
      } catch (err) {
        console.error("Failed to load tags");
      } finally {
        setLoadingTags(false);
      }
    };
    fetchTags();
  }, []);

  // Sync selected tags with form
  useEffect(() => {
    setSelectedTags(watchedTags || []);
  }, [watchedTags]);

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(t => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(newTags);
    setValue("tags", newTags);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + images.length > 4) {
        alert("Maximum 4 images allowed");
        return;
      }
      setImages(prev => [...prev, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("storeToken");
      const storeId = localStorage.getItem("storeId");

      if (!token || !storeId) {
        alert("Session expired");
        router.push("/login");
        return;
      }

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

      // Append tags
      data.tags.forEach(tag => formData.append("tags", tag));

      // Append images
      images.forEach(img => formData.append("images", img));

      const url = product
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/products/${product._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000"}/api/products`;

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Failed");

      alert(product ? "Updated!" : "Created!");
      onSave?.();
      router.push("/dashboard/products");
    } catch (err: any) {
      alert(err.message || "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto space-y-8 bg-white p-8 rounded-2xl shadow-xl">
      <h2 className="text-3xl font-bold">{product ? "Edit" : "Add New"} Product</h2>

      {/* Name & SKU */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Product Name *</Label>
          <Input {...register("name")} placeholder="OnePlus 12 16GB/512GB" className="mt-1" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label>SKU *</Label>
          <Input {...register("sku")} placeholder="OP12-16513" className="mt-1" />
          {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} rows={4} className="mt-1" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label>Price (₹) *</Label>
          <Input type="number" step="1" {...register("price", { valueAsNumber: true })} className="mt-1" />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price?.message}</p>}
        </div>

        <div>
          <Label>Stock *</Label>
          <Input type="number" {...register("stock", { valueAsNumber: true })} className="mt-1" />
          {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
        </div>

        <div>
          <Label>Category *</Label>
          {loadingCategories ? (
            <p className="text-sm text-gray-500 mt-1">Loading...</p>
          ) : (
            <Select onValueChange={(v) => setValue("category", v)} defaultValue={watch("category")}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat._id || cat.id} value={cat._id || cat.id}>
                    {cat.name} {cat.parentCategory && `← ${cat.parentCategory.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
        </div>
      </div>

      {/* Tags Multi-Select */}
      <div>
        <Label>Tags (Optional)</Label>
        <div className="mt-2 space-y-3">
          <div className="flex flex-wrap gap-2">
            {loadingTags ? (
              <p className="text-sm text-gray-500">Loading tags...</p>
            ) : (
              tags.map(tag => (
                <Badge
                  key={tag._id}
                  className={`cursor-pointer hover:scale-105 transition ${selectedTags.includes(tag._id || tag.id) ? "text-white" : "border"}`}
                  onClick={() => toggleTag(tag._id || tag.id)}
                  style={{ backgroundColor: selectedTags.includes(tag._id || tag.id) ? tag.color : undefined }}
                >
                  {tag.name}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <Label>Images (Max 4)</Label>
        <Input type="file" accept="image/*" multiple onChange={handleImageChange} className="mt-2" />
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img src={URL.createObjectURL(img)} alt="" className="w-full h-32 object-cover rounded-lg border" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : product ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}