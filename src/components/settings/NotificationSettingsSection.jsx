import React from "react";

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

const REMINDER_OPTIONS = [
  { value: "1", label: "1 hour before" },
  { value: "3", label: "3 hours before" },
  { value: "24", label: "24 hours before" },
  { value: "48", label: "48 hours before" },
];

export default function NotificationSettingsSection({ data, onChange }) {
  return (
    <div className="space-y-4">
      <Toggle
        value={data.reminders_enabled}
        onChange={(v) => onChange("reminders_enabled", v)}
        label="Enable Appointment Reminders"
        description="Send reminders to clients before their appointment"
      />

      {data.reminders_enabled && (
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500">Reminder Time</label>
          <div className="flex flex-wrap gap-2">
            {REMINDER_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => onChange("reminder_time", o.value)}
                className={`px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  data.reminder_time === o.value
                    ? "border-violet-400 bg-violet-100 text-violet-700"
                    : "border-gray-200 text-gray-600 hover:border-violet-200"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500">WhatsApp Reminder Template</label>
        <p className="text-[10px] text-gray-400">Variables: {"{{client_name}}, {{date}}, {{time}}, {{business_name}}, {{services}}"}</p>
        <textarea
          value={data.whatsapp_template || ""}
          onChange={(e) => onChange("whatsapp_template", e.target.value)}
          rows={3}
          className="w-full rounded-xl border-2 border-gray-100 focus:border-violet-300 px-3 py-2 text-sm focus:outline-none resize-none"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-gray-500">Email Reminder Template</label>
        <p className="text-[10px] text-gray-400">Variables: {"{{client_name}}, {{date}}, {{time}}, {{business_name}}, {{services}}, {{address}}"}</p>
        <textarea
          value={data.email_template || ""}
          onChange={(e) => onChange("email_template", e.target.value)}
          rows={5}
          className="w-full rounded-xl border-2 border-gray-100 focus:border-violet-300 px-3 py-2 text-sm focus:outline-none resize-none font-mono"
        />
      </div>
    </div>
  );
}