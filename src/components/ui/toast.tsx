"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "../lib/cn";
import { v4 as uuid } from "uuid";

interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, "id">) => {
    setToasts((prev) => [...prev, { ...toast, id: uuid() }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}

// Hook
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function Toaster() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "max-w-md w-full bg-white border shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5",
            toast.variant === "destructive" && "border-red-500"
          )}
        >
          <div className="flex-1 w-0 p-4">
            {toast.title && <p className="text-sm font-medium">{toast.title}</p>}
            <p className="mt-1 text-sm text-gray-600">{toast.description}</p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="p-4 hover:bg-gray-100 rounded-r-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Export Toast functions
export const toast = {
  success: (message: string) =>
    useToast().addToast({ description: message }),
  error: (message: string) =>
    useToast().addToast({ description: message, variant: "destructive" }),
};
