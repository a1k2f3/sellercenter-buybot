// src/app/(auth)/login/page.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError("");
    setError("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/store/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Success! Save data to localStorage
      localStorage.setItem("storeToken", result.token);
      localStorage.setItem("storeId", result._id);
      localStorage.setItem("storeName", result.name);
      localStorage.setItem("storeEmail", result.email);

      // Optional: Save as object
      localStorage.setItem("store", JSON.stringify(result));

      // Redirect to dashboard
      router.push("/dashboard");
      router.refresh(); // if using Next.js App Router with server components

    } catch (err: any) {
      setError(err.message || "Something went wrong. Try again.");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl border border-gray-200">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Store Login</h1>
          <p className="text-gray-600 mt-2">Welcome back, merchant!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="email" className="text-gray-700">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="akifse25@gmail.com"
              {...register("email")}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="password" className="text-gray-700">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className="mt-1"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login to Dashboard"}
          </Button>

          <div className="text-center text-sm text-gray-500 mt-6">
            <p>Test Credentials:</p>
            <p className="font-mono mt-2">
              <strong>Email:</strong> akifse25@gmail.com
              <br />
              <strong>Pass:</strong> yourpassword123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}