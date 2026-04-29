import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Calendar, CalendarX, Clock, ZapIcon, CalendarCheck } from "lucide-react";

export default function DayDetailModal({ open, onOpenChange, date, flexiDates = [] }) {
  if (!date) return null;

  const dateString = format(date, "yyyy-MM-dd");
  const dayRules = flexiDates.filter((f) => f.date === dateString);

  const ruleConfig = {
    closed_day: { label: "Closed Day", icon: CalendarX, cls: "bg-red-50 border-red-200 text-red-700" },
    block_time: { label: "Blocked Time", icon: Clock, cls: "bg-amber-50 border-amber-200 text-amber-700" },
    special_hours: { label: "Special Hours", icon: ZapIcon, cls: "bg-teal-50 border-teal-200 text-teal-700" },
    extra_working_day: { label: "Extra Working Day", icon: CalendarCheck, cls: "bg-green-50 border-green-200 text-green-700" },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
              <Calendar className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-bold">{format(date, "EEEE")}</div>
              <div className="text-sm font-normal text-gray-500">{format(date, "MMMM d, yyyy")}</div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3 mt-2">
          {dayRules.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Regular working day — no special rules.</p>
          ) : (
            dayRules.map((rule, idx) => {
              const cfg = ruleConfig[rule.schedule_type] || ruleConfig.closed_day;
              const Icon = cfg.icon;
              return (
                <div key={idx} className={`rounded-xl border p-3 flex items-start gap-3 ${cfg.cls}`}>
                  <Icon className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">{cfg.label}</p>
                    {(rule.start_time || rule.end_time) && (
                      <p className="text-xs mt-0.5">{rule.start_time} – {rule.end_time}</p>
                    )}
                    {rule.notes && <p className="text-xs italic mt-0.5 opacity-80">{rule.notes}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}