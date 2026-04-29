import React from "react";
import { Input } from "@/components/ui/input";
import { Building2, User, Phone, Mail, MapPin, Globe, ImageIcon, FileText } from "lucide-react";
import { base44 } from "@/api/base44Client";

function Field({ icon: FieldIcon, label, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
        <FieldIcon className="w-3.5 h-3.5" />{label}
      </label>
      {children}
    </div>
  );
}

export default function BusinessProfileSection({ data, onChange }) {
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    onChange("logo_url", file_url);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field icon={Building2} label="Business Name">
          <Input value={data.business_name || ""} onChange={(e) => onChange("business_name", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="e.g. YMY Pro Salon" />
        </Field>
        <Field icon={User} label="Owner Name">
          <Input value={data.owner_name || ""} onChange={(e) => onChange("owner_name", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="Your full name" />
        </Field>
        <Field icon={Phone} label="Phone Number">
          <Input value={data.phone || ""} onChange={(e) => onChange("phone", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="+1 555 000 0000" />
        </Field>
        <Field icon={Mail} label="Email">
          <Input value={data.email || ""} type="email" onChange={(e) => onChange("email", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="contact@salon.com" />
        </Field>
        <Field icon={MapPin} label="Address">
          <Input value={data.address || ""} onChange={(e) => onChange("address", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="123 Main St, City" />
        </Field>
        <Field icon={Globe} label="Website / Social Media">
          <Input value={data.website || ""} onChange={(e) => onChange("website", e.target.value)} className="rounded-xl border-2 border-gray-100 focus:border-violet-300" placeholder="https://instagram.com/mysalon" />
        </Field>
      </div>

      <Field icon={FileText} label="Business Description">
        <textarea
          value={data.description || ""}
          onChange={(e) => onChange("description", e.target.value)}
          rows={3}
          placeholder="Describe your salon — services, ambiance, specialties..."
          className="w-full rounded-xl border-2 border-gray-100 focus:border-violet-300 px-3 py-2 text-sm focus:outline-none resize-none"
        />
      </Field>

      <Field icon={ImageIcon} label="Business Logo">
        <div className="flex items-center gap-4">
          {data.logo_url && (
            <img src={data.logo_url} alt="Logo" className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-100 shadow-sm" />
          )}
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-dashed border-violet-200 hover:border-violet-400 cursor-pointer text-sm text-violet-600 font-semibold transition-colors bg-violet-50/50">
            <ImageIcon className="w-4 h-4" />
            {data.logo_url ? "Change Logo" : "Upload Logo"}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          </label>
        </div>
      </Field>
    </div>
  );
}