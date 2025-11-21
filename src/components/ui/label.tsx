// src/components/ui/label.tsx
"use client"
import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "../lib/cn";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-gray-700", className)}
      {...props}
    />
  )
);
Label.displayName = "Label";