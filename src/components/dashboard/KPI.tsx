// src/components/dashboard/KPI.tsx
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface KPIProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
}

export function KPI({ title, value, change, positive }: KPIProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {change && (
          <div
            className={`flex items-center gap-1 mt-2 text-sm ${
              positive ? "text-green-600" : "text-red-600"
            }`}
          >
            {positive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{change}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}