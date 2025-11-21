// src/lib/mock-data/orders.ts
import { v4 as uuidv4 } from "uuid";

export const mockOrders = [
  {
    id: "ORD-2025-001",
    customer: "John Doe",
    total: 12999,
    status: "DELIVERED" as const,
    items: [
      { name: "Wireless Headphones", qty: 1, price: 9999 },
      { name: "USB-C Cable", qty: 1, price: 3000 },
    ],
    createdAt: "2025-04-01T10:30:00Z",
    tracking: "1Z999AA10123456784",
  },
  {
    id: "ORD-2025-002",
    customer: "Jane Smith",
    total: 4999,
    status: "SHIPPED" as const,
    items: [{ name: "Phone Case", qty: 1, price: 4999 }],
    createdAt: "2025-04-02T14:20:00Z",
    tracking: "1Z999BB20234567890",
  },
  {
    id: "ORD-2025-003",
    customer: "Mike Johnson",
    total: 89900,
    status: "PAID" as const,
    items: [
      { name: "Laptop Stand", qty: 2, price: 35000 },
      { name: "Webcam", qty: 1, price: 19900 },
    ],
    createdAt: "2025-04-03T09:15:00Z",
  },
  {
    id: "ORD-2025-004",
    customer: "Sarah Williams",
    total: 2499,
    status: "PENDING" as const,
    items: [{ name: "Mouse Pad", qty: 1, price: 2499 }],
    createdAt: "2025-04-03T16:45:00Z",
  },
  {
    id: "ORD-2025-005",
    customer: "David Brown",
    total: 159800,
    status: "PACKED" as const,
    items: [
      { name: "Monitor 27\"", qty: 1, price: 129900 },
      { name: "HDMI Cable", qty: 1, price: 29900 },
    ],
    createdAt: "2025-04-02T11:00:00Z",
  },
];