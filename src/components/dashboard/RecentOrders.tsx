// src/components/dashboard/RecentOrders.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockOrders } from "../lib/mock-data/orders";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { format } from "date-fns";

export function RecentOrders() {
  const recent = mockOrders.slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recent.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <p className="font-medium">{order.id}</p>
                <p className="text-gray-500">{order.customer}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  ${(order.total / 100).toFixed(2)}
                </p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}