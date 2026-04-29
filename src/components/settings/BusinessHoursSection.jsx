import React from "react";

const DAYS = [
  { key: "hours_monday", label: "Monday" },
  { key: "hours_tuesday", label: "Tuesday" },
  { key: "hours_wednesday", label: "Wednesday" },
  { key: "hours_thursday", label: "Thursday" },
  { key: "hours_friday", label: "Friday" },
  { key: "hours_saturday", label: "Saturday" },
  { key: "hours_sunday", label: "Sunday" },
];

const TIME_OPTIONS = [];
for (let h = 5; h <= 23; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

function TimeSelect({ value, onChange, disabled }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="rounded-xl border-2 border-gray-100 px-2 py-1.5 text-xs bg-white focus:outline-none focus:border-violet-300 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <option value="">--</option>
      {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
    </select>
  );
}

export default function BusinessHoursSection({ data, onChange }) {
  const updateDay = (dayKey, field, value) => {
    const current = data[dayKey] || {};
    onChange(dayKey, { ...current, [field]: value });
  };

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid grid-cols-[120px_60px_1fr] gap-2 px-3 mb-1">
        <span className="text-xs font-bold text-gray-400">Day</span>
        <span className="text-xs font-bold text-gray-400">Open</span>
        <span className="text-xs font-bold text-gray-400">Hours &amp; Break</span>
      </div>
      {DAYS.map(({ key, label }) => {
        const day = data[key] || { open: false, start: "09:00", end: "18:00", break_start: "", break_end: "" };
        return (
          <div key={key} className={`rounded-xl border-2 p-3 transition-all ${day.open ? "border-violet-200 bg-violet-50/40" : "border-gray-100 bg-gray-50/60"}`}>
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-[110px] text-sm font-semibold text-gray-700 shrink-0">{label}</span>
              {/* Toggle */}
              <button
                type="button"
                onClick={() => updateDay(key, "open", !day.open)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${day.open ? "bg-violet-500" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${day.open ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              {day.open ? (
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <TimeSelect value={day.start} onChange={(v) => updateDay(key, "start", v)} />
                  <span className="text-gray-400">to</span>
                  <TimeSelect value={day.end} onChange={(v) => updateDay(key, "end", v)} />
                  <span className="text-gray-300 mx-1">|</span>
                  <span className="text-gray-400">Break:</span>
                  <TimeSelect value={day.break_start} onChange={(v) => updateDay(key, "break_start", v)} />
                  <span className="text-gray-400">–</span>
                  <TimeSelect value={day.break_end} onChange={(v) => updateDay(key, "break_end", v)} />
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Closed</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}