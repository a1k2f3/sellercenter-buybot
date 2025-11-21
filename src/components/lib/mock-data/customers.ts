// src/lib/mock-data/customers.ts
import { v4 as uuidv4 } from "uuid";

export const mockCustomers = [
  {
    id: uuidv4(),
    name: "John Doe",
    email: "john@example.com",
    orders: 12,
    spent: 1249.99,
    joined: "2025-01-15",
  },
  {
    id: uuidv4(),
    name: "Jane Smith",
    email: "jane@shop.com",
    orders: 8,
    spent: 899.50,
    joined: "2025-02-20",
  },
  {
    id: uuidv4(),
    name: "Mike Johnson",
    email: "mike@business.co",
    orders: 25,
    spent: 3420.00,
    joined: "2024-11-10",
  },
  {
    id: uuidv4(),
    name: "Sarah Williams",
    email: "sarah@email.com",
    orders: 5,
    spent: 450.75,
    joined: "2025-03-05",
  },
  {
    id: uuidv4(),
    name: "David Brown",
    email: "david@corp.org",
    orders: 15,
    spent: 2100.00,
    joined: "2024-12-01",
  },
];