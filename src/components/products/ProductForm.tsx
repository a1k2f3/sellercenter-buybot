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
import { Upload, X } from "lucide-react"; // Optional icons

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
// Form Schema (updated price/stock to handle numbers properly)
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
  const [isDragging, setIsDragging] = useState(false);

  const MAX_IMAGES = 10;

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

  useEffect(() => {
    setSelectedTags(watchedTags || []);
  }, [watchedTags]);

  // Fetch Categories & Tags (unchanged)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        if (!token) {
          alert("No auth token found. Redirecting to login.");
          router.push("/login");
          return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load categories");
        const data = await res.json();
        setCategories(data?.data || []);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to load categories");
      }
    };
    fetchCategories();
  }, [router]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const token = localStorage.getItem("storeToken");
        if (!token) {
          alert("No auth token found. Redirecting to login.");
          router.push("/login");
          return;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load tags");
        const data = await res.json();
        setTags(data?.data || []);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Failed to load tags");
      }
    };
    fetchTags();
  }, [router]);

  const toggleTag = (tagId: string) => {
    const updated = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];

    setSelectedTags(updated);
    setValue("tags", updated);
  };

  // ----------------------
  // Image Handling (Drag & Drop + Click)
  // ----------------------
  const handleFiles = (files: File[]) => {
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length === 0) {
      alert("Please upload only image files");
      return;
    }

    const newImages = [...images, ...validFiles].slice(0, MAX_IMAGES);
    if (newImages.length < images.length + validFiles.length) {
      alert(`Maximum ${MAX_IMAGES} images allowed. Only added up to the limit.`);
    }
    setImages(newImages);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  // ----------------------
  // Submit Handler
  // ----------------------
  const onError = () => {
    alert("Please fill all required fields correctly");
  };

  const onSubmit = async (data: FormData) => {
    if (images.length === 0) {
      alert("At least one image is required");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("storeToken");
      const storeId = localStorage.getItem("storeId");
      if (!token || !storeId) return router.push("/login");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description || "");
      formData.append("price", data.price.toString());
      formData.append("currency", "INR");
      formData.append("stock", data.stock.toString());
      formData.append("status", "active");
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("brand", storeId);

      data.tags?.forEach((t) => formData.append("tags", t));
      images.forEach((img) => formData.append("images", img));

      const url = product
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${product._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`;

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error ${res.status}: ${errorText.substring(0, 100)}...`);
      }

      alert(product ? "Product updated!" : "Product created!");
      onSave?.();
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An error occurred");
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
              <Badge key={tag._id}  >
                <button
                  type="button"
                  onClick={() => toggleTag(tag._id)}
                  className={`px-4 py-2 rounded-full transition-all ${
                    isSelected
                      ? "text-white shadow-lg"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
                  style={{ backgroundColor: isSelected ? tag.color || "#3b82f6" : undefined }}
                >
                  {tag.name}
                </button>
              </Badge>
            );
          })}
        </div>
      </div>

      {/* Images - Drag & Drop */}
      <div>
        <Label>Images (Max {MAX_IMAGES}, at least 1 required)</Label>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-2 border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg text-gray-600">
            Drag & drop images here, or click to select
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Up to {MAX_IMAGES} images • JPG, PNG, WebP
          </p>

          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="mt-6 max-w-xs mx-auto cursor-pointer"
          />
        </div>

        {/* Image Previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs py-1 text-center">
                  {img.name.substring(0, 15)}...
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <p className="mt-4 text-sm text-gray-600 text-center">
            {images.length}/{MAX_IMAGES} images selected
          </p>
        )}
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