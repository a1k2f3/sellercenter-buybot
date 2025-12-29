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
import { Upload, X, Plus, Trash2 } from "lucide-react";

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

interface ExistingMedia {
  url: string;
  public_id: string;
  thumbnail?: string;
}

interface Props {
  product?: any;
  onSave?: () => void;
}

const schema = z.object({
  name: z.string().min(3, "Product name is required"),
  description: z.string().optional(),
  price: z.number().min(1, "Price must be at least 1"),
  discountPrice: z.number().optional().nullable(),
  stock: z.number().min(0, "Stock cannot be negative"),
  sku: z.string().min(1, "SKU is required"),
  category: z.string().min(1, "Select a category"),
  warranty: z.string().optional(),
  ageGroup: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof schema>;

const AGE_GROUPS = [
  "Newborn (0-3 months)",
  "Infant (3-12 months)",
  "Toddler (1-3 years)",
  "Kids (4-12 years)",
  "Teen (13-18 years)",
  "Adult",
  "All Ages",
] as const;

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "One Size"];

export default function ProductForm({ product, onSave }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Media states
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<ExistingMedia[]>([]);
  const [existingVideos, setExistingVideos] = useState<ExistingMedia[]>([]);

  // Form states
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([{ key: "", value: "" }]);
  const [isDragging, setIsDragging] = useState<"images" | "videos" | null>(null);

  const MAX_IMAGES = 10;
  const MAX_VIDEOS = 3;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || "",
      description: product?.description || "",
      price: product?.price || 0,
      discountPrice: product?.discountPrice ?? null,
      stock: product?.stock || 0,
      sku: product?.sku || "",
      category: product?.category?._id || "",
      warranty: product?.warranty || "",
      ageGroup: product?.ageGroup ?? null,
      tags: product?.tags?.map((t: any) => t._id) || [],
    },
  });

  const watchedTags = watch("tags");
  const watchedCategory = watch("category");
  const watchedAgeGroup = watch("ageGroup");

  // Load existing data when editing
  useEffect(() => {
    if (product) {
      setExistingImages(product.images || []);
      setExistingVideos(product.videos || []);
      setSelectedTags(product.tags?.map((t: any) => t._id) || []);
      setSelectedSizes(product.size || []);

      if (product.specifications && typeof product.specifications === 'object' && !Array.isArray(product.specifications) && product.specifications !== null) {
        const specsArray = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setSpecs(specsArray.length > 0 ? specsArray : [{ key: "", value: "" }]);
      }
    }
  }, [product]);

  useEffect(() => {
    setSelectedTags(watchedTags || []);
  }, [watchedTags]);

  // Fetch categories & tags
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("storeToken");
      if (!token) return router.push("/login");

      try {
        const [catRes, tagRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/tags`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData?.data || []);
        }
        if (tagRes.ok) {
          const tagData = await tagRes.json();
          setTags(tagData?.data || []);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to load categories or tags");
      }
    };
    fetchData();
  }, [router]);

  const toggleTag = (tagId: string) => {
    const updated = selectedTags.includes(tagId)
      ? selectedTags.filter((t) => t !== tagId)
      : [...selectedTags, tagId];
    setSelectedTags(updated);
    setValue("tags", updated);
  };

  const toggleSize = (size: string) => {
    const updated = selectedSizes.includes(size)
      ? selectedSizes.filter((s) => s !== size)
      : [...selectedSizes, size];
    setSelectedSizes(updated);
  };

  const addSpecRow = () => setSpecs([...specs, { key: "", value: "" }]);
  const removeSpecRow = (index: number) => {
    if (specs.length > 1) {
      setSpecs(specs.filter((_, i) => i !== index));
    }
  };
  const updateSpec = (index: number, field: "key" | "value", value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  // Media handling
  const handleFiles = (files: FileList | null, type: "images" | "videos") => {
    if (!files) return;
    const fileArray = Array.from(files);

    if (type === "images") {
      const valid = fileArray.filter((f) => f.type.startsWith("image/"));
      const newImages = [...images, ...valid].slice(0, MAX_IMAGES);
      setImages(newImages);
      if (newImages.length < images.length + valid.length) {
        alert(`Maximum ${MAX_IMAGES} images allowed`);
      }
    } else {
      const valid = fileArray.filter((f) => f.type.startsWith("video/"));
      const newVideos = [...videos, ...valid].slice(0, MAX_VIDEOS);
      setVideos(newVideos);
      if (newVideos.length < videos.length + valid.length) {
        alert(`Maximum ${MAX_VIDEOS} videos allowed`);
      }
    }
  };

  const removeNewFile = (type: "images" | "videos", index: number) => {
    if (type === "images") setImages(images.filter((_, i) => i !== index));
    else setVideos(videos.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormData) => {
    if (images.length + existingImages.length === 0) {
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
      if (data.discountPrice != null) {
        formData.append("discountPrice", data.discountPrice.toString());
      }
      formData.append("currency", "RS");
      formData.append("stock", data.stock.toString());
      formData.append("status", "draft");
      formData.append("sku", data.sku);
      formData.append("category", data.category);
      formData.append("brand", storeId);
      if (data.warranty?.trim()) formData.append("warranty", data.warranty.trim());
      if (data.ageGroup) formData.append("ageGroup", data.ageGroup);

      selectedTags.forEach((t) => formData.append("tags", t));
      selectedSizes.forEach((s) => formData.append("size", s));

      const validSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
      if (validSpecs.length > 0) {
        const specsObj = Object.fromEntries(validSpecs.map((s) => [s.key.trim(), s.value.trim()]));
        formData.append("specifications", JSON.stringify(specsObj));
      }

      images.forEach((img) => formData.append("images", img));
      videos.forEach((vid) => formData.append("videos", vid));

      const url = product
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products/${product._id}`
        : `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/products`;

      const res = await fetch(url, {
        method: product ? "PUT" : "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to save product");
      }
      console.log(`Submitting with ${images.length} new + ${existingImages.length} existing images`);

      alert(product ? "Product updated successfully!" : "Product created successfully!");
      onSave?.();
      router.push("/dashboard/products");
    } catch (err: any) {
      console.error("Submit error:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-6xl mx-auto bg-white p-8 rounded-3xl shadow-2xl space-y-10"
    >
      <h2 className="text-4xl font-bold text-center">{product ? "Edit Product" : "Add New Product"}</h2>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Product Name *</Label>
          <Input {...register("name")} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.name?.message}</p>
        </div>
        <div>
          <Label>SKU *</Label>
          <Input {...register("sku")} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.sku?.message}</p>
        </div>
      </div>

      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} rows={5} className="mt-2" />
      </div>

      {/* Price & Stock */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <Label>Price (RS) *</Label>
          <Input type="number" {...register("price", { valueAsNumber: true })} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.price?.message}</p>
        </div>
        <div>
          <Label>Discount Price (RS)</Label>
          <Input type="number" {...register("discountPrice", { valueAsNumber: true })} className="mt-2" placeholder="Optional" />
        </div>
        <div>
          <Label>Stock *</Label>
          <Input type="number" {...register("stock", { valueAsNumber: true })} className="mt-2" />
          <p className="text-red-500 text-sm">{errors.stock?.message}</p>
        </div>
        <div>
          <Label>Category *</Label>
          <Select onValueChange={(v) => setValue("category", v)} value={watchedCategory}>
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

      {/* Warranty & Age Group */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Warranty</Label>
          <Input {...register("warranty")} placeholder="e.g., 1 Year Manufacturer Warranty" className="mt-2" />
        </div>
        <div>
          <Label>Age Group (Optional)</Label>
          <Select
            onValueChange={(value) => setValue("ageGroup", value === "none" ? null : value)}
            value={watchedAgeGroup ?? "none"}
          >
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Select age group" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No specific age group</SelectItem>
              {AGE_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-3 mt-3">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag._id);
            return (
              <button
                key={tag._id}
                type="button"
                onClick={() => toggleTag(tag._id)}
                className={`px-5 py-2 rounded-full font-medium transition-all border-2 ${
                  isSelected
                    ? "text-white shadow-lg border-transparent"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
                style={{ backgroundColor: isSelected ? tag.color || "#3b82f6" : undefined }}
              >
                {tag.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <Label>Available Sizes</Label>
        <div className="flex flex-wrap gap-3 mt-3">
          {COMMON_SIZES.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => toggleSize(size)}
              className={`px-5 py-3 rounded-lg font-semibold border-2 transition-all ${
                selectedSizes.includes(size)
                  ? "bg-black text-white border-black"
                  : "border-gray-300 hover:bg-gray-100"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Specifications */}
      <div>
        <Label>Specifications</Label>
        <div className="mt-3 space-y-3">
          {specs.map((spec, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Input
                placeholder="Key (e.g., Material)"
                value={spec.key}
                onChange={(e) => updateSpec(i, "key", e.target.value)}
                className="flex-1"
              />
              <Input
                placeholder="Value (e.g., Cotton)"
                value={spec.value}
                onChange={(e) => updateSpec(i, "value", e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                onClick={() => removeSpecRow(i)}
                disabled={specs.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addSpecRow} className="mt-2">
            <Plus className="w-4 h-4 mr-2" /> Add Specification
          </Button>
        </div>
      </div>

      {/* Images Upload - FIXED */}
      <div>
        <Label>Product Images (Max {MAX_IMAGES}) *</Label>
        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(null);
            handleFiles(e.dataTransfer.files, "images");
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging("images");
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            setIsDragging(null);
          }}
          className={`mt-3 border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            isDragging === "images" ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium">Drop images here or click to upload</p>
          <p className="text-sm text-gray-500">JPG, PNG, GIF, WebP • Up to {MAX_IMAGES} images</p>

          {/* Hidden file input */}
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFiles(e.target.files, "images")}
            className="hidden"
            id="image-upload"
          />
          {/* Clickable button */}
          <label
            htmlFor="image-upload"
            className="mt-6 inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            Choose Images
          </label>
        </div>

        {(existingImages.length > 0 || images.length > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4 mt-6">
            {existingImages.map((img) => (
              <div key={img.public_id} className="relative group rounded-xl overflow-hidden border">
                <img src={img.url} alt="Existing product image" className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Badge>Existing</Badge>
                </div>
              </div>
            ))}
            {images.map((img, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border">
                <img src={URL.createObjectURL(img)} alt="New product image preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile("images", i)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Videos Upload - FIXED */}
      <div>
        <Label>Product Videos (Max {MAX_VIDEOS}, optional)</Label>
        <div
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(null);
            handleFiles(e.dataTransfer.files, "videos");
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging("videos");
          }}
          onDragLeave={(e) => {
            e.stopPropagation();
            setIsDragging(null);
          }}
          className={`mt-3 border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer ${
            isDragging === "videos" ? "border-green-500 bg-green-50" : "border-gray-300"
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium">Drop videos here or click to upload</p>
          <p className="text-sm text-gray-500">MP4, WebM, MOV • Up to {MAX_VIDEOS} videos • Max 100MB</p>

          <input
            type="file"
            multiple
            accept="video/*"
            onChange={(e) => handleFiles(e.target.files, "videos")}
            className="hidden"
            id="video-upload"
          />
          <label
            htmlFor="video-upload"
            className="mt-6 inline-block px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition cursor-pointer"
          >
            Choose Videos
          </label>
        </div>

        {(existingVideos.length > 0 || videos.length > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            {existingVideos.map((vid) => (
              <div key={vid.public_id} className="relative rounded-xl overflow-hidden border bg-gray-50">
                <video src={vid.url} controls className="w-full h-64 object-cover" />
                <Badge className="absolute top-2 left-2">Existing</Badge>
              </div>
            ))}
            {videos.map((vid, i) => (
              <div key={i} className="relative rounded-xl overflow-hidden border">
                <video src={URL.createObjectURL(vid)} controls className="w-full h-64 object-cover" />
                <button
                  type="button"
                  onClick={() => removeNewFile("videos", i)}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4 pt-8 border-t">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard/products")}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="px-8">
          {isLoading ? "Saving..." : product ? "Update Product" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}