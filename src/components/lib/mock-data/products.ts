// src/lib/mock-data/products.ts
// import { Product } from ".";
import { Product } from "@/components/types";
import { v4 as uuidv4 } from "uuid";

export const mockProducts: Product[] = [
  {
    id: uuidv4(),
    title: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "Premium noise-cancelling headphones with 30hr battery",
    price: 9999,
    images: ["/images/headphones.jpg"],
    variants: [
      { id: uuidv4(), color: "Black", stock: 45, price: 9999 },
      { id: uuidv4(), color: "White", stock: 12, price: 9999 },
    ],
    stock: 57,
    sku: "WH-001",
    category: "Electronics",
    createdAt: "2025-11-01",
  },
  {
    id: uuidv4(),
    title: "Wireless Headphones",
    slug: "wireless-headphones",
    description: "Premium noise-cancelling headphones with 30hr battery",
    price: 9999,
    images: ["/images/headphones.jpg"],
    variants: [
      { id: uuidv4(), color: "Black", stock: 45, price: 9999 },
      { id: uuidv4(), color: "White", stock: 12, price: 9999 },
    ],
    stock: 57,
    sku: "WH-001",
    category: "Electronics",
    createdAt: "2025-11-01",
  },
  {
    id: uuidv4(),
    title: "USB-C Cable",
    slug: "usb-c-cable",
    description: "Fast charging 100W USB-C to USB-C cable",
    price: 3000,
    images: ["/images/cable.jpg"],
    stock: 120,
    sku: "UC-101",
    category: "Accessories",
    createdAt: "2025-10-20",
  },
  {
    id: uuidv4(),
    title: "Laptop Stand",
    slug: "laptop-stand",
    description: "Ergonomic aluminum stand for 13-17\" laptops",
    price: 35000,
    images: ["/images/stand.jpg"],
    stock: 8,
    sku: "LS-200",
    category: "Office",
    createdAt: "2025-09-15",
  },
  // ... more
];