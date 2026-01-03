// src/app/(dashboard)/orders/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

interface Product {
  _id: string;
  name: string;
  price: number;
  images: { url: string }[];
  description?: string;
}

interface OrderItem {
  _id: string;
  product: Product;
  quantity: number;
  size:string
  price: number;
  total: number;
}

interface OrderDetails {
  _id: string;
  orderId: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    name: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
    country: string;
  };
  items: OrderItem[];
  storeTotal: number;
  overallOrderTotal: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
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

    if (!orderId) {
      setError("Invalid order ID.");
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/store/order/${orderId}?storeId=${storeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          if (response.status === 404) setError("Order not found.");
          else if (response.status === 403) setError("You don't have permission to view this order.");
          else if (response.status === 401) setError("Session expired. Please log in again.");
          else setError("Failed to load order details.");
          return;
        }

        const data = await response.json();
        setOrder(data.order);
        console.log("Fetched order data:", data.order);
      } catch (err) {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-xl text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-xl text-red-700 font-medium">{error}</p>
          <Link href="/dashboard/orders" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Order #{order.orderId.slice(-8).toUpperCase()}</h1>
          <p className="text-gray-600 mt-1">
            Placed on {format(new Date(order.createdAt), "dd MMMM yyyy, hh:mm a")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-green-600">
            RS{order.storeTotal.toLocaleString("en-IN")}
          </p>
          <p className="text-sm text-gray-500">Your Earnings</p>
        </div>
      </div>

      {/* Status & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-sm text-gray-600">Order Status</p>
          <p className="text-xl font-bold mt-1">{order.status}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-sm text-gray-600">Payment Method</p>
          <p className="text-xl font-bold mt-1">{order.paymentMethod}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-5">
          <p className="text-sm text-gray-600">Payment Status</p>
          <p className={`text-xl font-bold mt-1 ${order.paymentStatus === "Paid" ? "text-green-600" : "text-orange-600"}`}>
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* Ordered Items */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Items Ordered</h2>
        <div className="space-y-6">
          {order.items.map((item) => (
            <div key={item._id} className="bg-white border border-gray-200 rounded-lg p-6 flex gap-6">
              {/* Product Images */}
              <div className="flex-shrink-0">
                {item.product?.images?.length > 0 ? (
                  <Image
                    src={item.product.images[0].url}
                    alt="Product"
                    width={140}
                    height={140}
                    className="rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-36 h-36 bg-gray-200 rounded-lg flex items-center justify-center">
                    <span className="text-gray-500">No image</span>
                  </div>
                )}
              </div>

              {/* Item Details */}
              <div className="flex-grow">
                <h3 className="text-xl font-semibold">Product ID: {item.product?._id?.slice(-8).toUpperCase() || "N/A"}</h3>
                <h3 className="text-xl font-semibold">Product name: {item.product?.name || "N/A"}</h3>
                {item.product?.description && (
                  <p className="text-gray-600 mt-2">{item.product.description}</p>
                )}
                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-bold ml-2">{item.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Price per item:</span>
                    <span className="font-bold ml-2">₹{item.price.toLocaleString("en-IN")}</span>
                    {item.size && <span className="font-bold ml-2">Size: {item.size}</span>}
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-2xl font-bold">₹{item.total.toLocaleString("en-IN")}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Customer & Shipping */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Customer Details</h2>
          <p><strong>Name:</strong> {order.customer.name}</p>
          <p><strong>Email:</strong> {order.customer.email}</p>
          <p><strong>Phone:</strong> {order.customer.phone}</p>
        </div>

        {/* Shipping Address */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Delivery Address</h2>
          <p><strong>Recipient:</strong> {order.shippingAddress.name}</p>
          <p><strong>Phone:</strong> {order.shippingAddress.phone}</p>
          <p className="mt-3">
            {order.shippingAddress.address},<br />
            {order.shippingAddress.city} - {order.shippingAddress.pincode}<br />
            {order.shippingAddress.country}
          </p>
        </div>
      </div>

      {/* Back Button */}
      <div className="text-center">
        <Link href="/dashboard/orders">
          <button className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition">
            ← Back to Orders
          </button>
        </Link>
      </div>
    </div>
  );
}