// src/types/index.ts
export type Role = "ADMIN" | "MANAGER" | "SUPPORT" | "VIEWER";

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  variants?: Variant[];
  stock: number;
  sku: string;
  category: string;
  createdAt: string;
}

export interface Variant {
  id: string;
  size?: string;
  color?: string;
  stock: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  total: number;
  status: "PENDING" | "PAID" | "PACKED" | "SHIPPED" | "DELIVERED" | "REFUNDED";
  items: { name: string; qty: number; price: number }[];
  createdAt: string;
  tracking?: string;
}