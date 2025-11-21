// src/app/(dashboard)/marketing/page.tsx
export default function MarketingPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Marketing</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">Discount Codes</div>
        <div className="bg-white p-6 rounded-xl shadow">Email Campaigns</div>
        <div className="bg-white p-6 rounded-xl shadow">Abandoned Carts</div>
        <div className="bg-white p-6 rounded-xl shadow">Gift Cards</div>
      </div>
    </div>
  );
}