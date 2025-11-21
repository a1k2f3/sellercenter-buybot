import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// src/app/(dashboard)/settings/page.tsx
export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="text-xl font-semibold">Store Info</h2>
        <Input placeholder="Store Name" />
        <Input placeholder="Currency" />
        <Button>Save Settings</Button>
      </div>
    </div>
  );
}