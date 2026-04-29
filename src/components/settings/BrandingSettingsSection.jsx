import React from "react";
import { Input } from "@/components/ui/input";

function ColorField({ label, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value || "#7c3aed"}
          onChange={(e) => onChange(e.target.value)}
          className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer p-0.5 bg-white"
        />
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl border-2 border-gray-100 focus:border-violet-300 font-mono text-sm"
          placeholder="#7c3aed"
        />
      </div>
    </div>
  );
}

export default function BrandingSettingsSection({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">App Display Name</label>
          <Input
            value={data.display_name || ""}
            onChange={(e) => onChange("display_name", e.target.value)}
            className="rounded-xl border-2 border-gray-100 focus:border-violet-300"
            placeholder="e.g. YMY Pro"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">Slogan (optional)</label>
          <Input
            value={data.slogan || ""}
            onChange={(e) => onChange("slogan", e.target.value)}
            className="rounded-xl border-2 border-gray-100 focus:border-violet-300"
            placeholder="e.g. Where beauty meets excellence"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <ColorField label="Primary Color" value={data.primary_color} onChange={(v) => onChange("primary_color", v)} />
        <ColorField label="Secondary Color" value={data.secondary_color} onChange={(v) => onChange("secondary_color", v)} />
        <ColorField label="Accent Color" value={data.accent_color} onChange={(v) => onChange("accent_color", v)} />
      </div>
      <div className="flex gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500">
          <p className="font-semibold mb-1">Preview</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: data.primary_color || "#7c3aed" }}>Primary</span>
            <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: data.secondary_color || "#ec4899" }}>Secondary</span>
            <span className="px-3 py-1 rounded-full text-white text-xs font-bold" style={{ backgroundColor: data.accent_color || "#f97316" }}>Accent</span>
          </div>
        </div>
      </div>
    </div>
  );
}