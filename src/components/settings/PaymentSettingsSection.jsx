import React from "react";
import { Input } from "@/components/ui/input";

const CURRENCIES = ["USD", "EUR", "GBP", "AED", "SAR", "IDR", "MYR", "SGD", "CAD", "AUD"];
const PAYMENT_METHODS = [
  { key: "cash", label: "💵 Cash" },
  { key: "card", label: "💳 Card" },
  { key: "bank_transfer", label: "🏦 Bank Transfer" },
  { key: "whatsapp_pay", label: "📱 WhatsApp Pay" },
  { key: "paypal", label: "🅿️ PayPal" },
  { key: "stripe", label: "⚡ Stripe" },
];

function Toggle({ value, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border-2 border-gray-100 bg-white">
      <div>
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {description && <p className="text-xs text-gray-400">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${value ? "bg-violet-500" : "bg-gray-300"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${value ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

export default function PaymentSettingsSection({ data, onChange }) {
  const togglePayment = (key) => {
    const current = data.payment_methods || [];
    const updated = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    onChange("payment_methods", updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500">Currency</label>
        <select
          value={data.currency || "USD"}
          onChange={(e) => onChange("currency", e.target.value)}
          className="w-full sm:w-48 rounded-xl border-2 border-gray-100 px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-300"
        >
          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold text-gray-500">Accepted Payment Methods</label>
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => togglePayment(key)}
              className={`px-3 py-1.5 rounded-xl border-2 text-sm font-medium transition-all ${
                (data.payment_methods || []).includes(key)
                  ? "border-violet-400 bg-violet-100 text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <Toggle
        value={data.deposit_required}
        onChange={(v) => onChange("deposit_required", v)}
        label="Require Deposit to Book"
        description="Clients must pay a deposit when booking"
      />

      {data.deposit_required && (
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">Deposit Type</label>
            <select
              value={data.deposit_type || "percentage"}
              onChange={(e) => onChange("deposit_type", e.target.value)}
              className="w-full rounded-xl border-2 border-gray-100 px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-300"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-500">
              {data.deposit_type === "fixed" ? `Amount (${data.currency || "USD"})` : "Percentage (%)"}
            </label>
            <Input
              type="number"
              min="0"
              value={data.deposit_value || ""}
              onChange={(e) => onChange("deposit_value", Number(e.target.value))}
              className="rounded-xl border-2 border-gray-100 focus:border-violet-300"
              placeholder={data.deposit_type === "fixed" ? "25" : "20"}
            />
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500">Cancellation Fee Rules (optional)</label>
        <Input
          value={data.cancellation_fee || ""}
          onChange={(e) => onChange("cancellation_fee", e.target.value)}
          className="rounded-xl border-2 border-gray-100 focus:border-violet-300"
          placeholder="e.g. 50% fee if cancelled within 24 hours"
        />
      </div>
    </div>
  );
}