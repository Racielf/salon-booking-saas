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

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-gray-500">{label}</label>
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border-2 border-gray-100 px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-300"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export default function AppointmentSettingsSection({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SelectField
          label="Default Duration (min)"
          value={data.default_duration}
          onChange={(v) => onChange("default_duration", Number(v))}
          options={[15, 30, 45, 60, 90, 120].map((n) => ({ value: n, label: `${n} min` }))}
        />
        <SelectField
          label="Time Slot Interval"
          value={data.slot_interval}
          onChange={(v) => onChange("slot_interval", Number(v))}
          options={[15, 30, 45, 60].map((n) => ({ value: n, label: `${n} min` }))}
        />
        <SelectField
          label="Buffer Between Appointments"
          value={data.buffer_time}
          onChange={(v) => onChange("buffer_time", Number(v))}
          options={[0, 5, 10, 15, 20, 30].map((n) => ({ value: n, label: n === 0 ? "None" : `${n} min` }))}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Toggle
          value={data.allow_same_day}
          onChange={(v) => onChange("allow_same_day", v)}
          label="Allow Same-Day Appointments"
          description="Clients can book for today"
        />
        <Toggle
          value={data.require_approval}
          onChange={(v) => onChange("require_approval", v)}
          label="Require Appointment Approval"
          description="Appointments need manual confirmation"
        />
      </div>
    </div>
  );
}