// src/app/(dashboard)/orders/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface Order {
  _id: string;
  userId: { name: string; phone?: string };
  items: { productId: { name: string }; quantity: number; price: number }[];
  storeTotal: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storeId = localStorage.getItem("storeId")?.replace(/"/g, "");
    const token = localStorage.getItem("token") || localStorage.getItem("storeToken");

    if (!storeId || !token) {
      setError("Please log in as a store owner.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/store-orders?storeId=${storeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) setError("Session expired. Please log in again.");
          else setError("Failed to load orders.");
          return;
        }
        
        const data = await response.json();
        console.log("Fetched orders data:", data);
        setOrders(data.orders || []);
      } catch (err) {
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-gray-600">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-red-600">{error}</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold mb-6">Store Orders</h1>
        <p className="text-xl text-gray-600">No orders yet.</p>
        <p className="text-gray-500 mt-2">Customer orders will appear here when placed.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Store Orders ({orders.length})</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Order ID</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Customer</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Items</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Your Earnings</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Status</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Payment</th>
              <th className="border border-gray-300 px-4 py-3 text-left text-sm font-semibold">Date</th>
              <th className="border border-gray-300 px-4 py-3 text-center text-sm font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0);

              return (
                <tr key={order._id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-3 text-sm font-mono">
                    #{order._id.slice(-8).toUpperCase()}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <div>
                      <p className="font-medium">{order.userId.name}</p>
                      {order.userId.phone && <p className="text-xs text-gray-500">{order.userId.phone}</p>}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm text-center">
                    {totalItems} item{totalItems > 1 ? "s" : ""}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm font-bold">
                    ₹{order.storeTotal.toLocaleString("en-IN")}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <span className="font-medium">{order.status}</span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    <span className={order.paymentStatus === "Paid" ? "text-green-600" : "text-orange-600"}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-sm">
                    {format(new Date(order.createdAt), "dd MMM yyyy")}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 text-center">
                    <Link href={`/dashboard/orders/${order._id}`}>
                      <button className="text-blue-600 hover:underline font-medium text-sm">
                        View →
                      </button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}