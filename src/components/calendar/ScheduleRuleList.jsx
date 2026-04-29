import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Trash2, CalendarX, Clock, CalendarCheck, ZapIcon, CalendarDays } from "lucide-react";

const TYPE_CONFIG = {
  closed_day: {
    label: "Closed Day",
    icon: CalendarX,
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-400",
  },
  block_time: {
    label: "Block Time",
    icon: Clock,
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  special_hours: {
    label: "Special Hours",
    icon: ZapIcon,
    bg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
  },
  extra_working_day: {
    label: "Extra Working Day",
    icon: CalendarCheck,
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
  },
};

export default function ScheduleRuleList({ scheduleRules, onDelete, loading }) {
  if (scheduleRules.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-5 border border-violet-100 text-center"
      >
        <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <CalendarDays className="w-6 h-6 text-violet-300" />
        </div>
        <h3 className="font-semibold text-gray-700 text-sm">No Schedule Rules</h3>
        <p className="text-xs text-gray-400 mt-1">Add closed days, block times, or special hours above.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm p-4 border border-violet-100"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
          <CalendarDays className="w-4 h-4 text-violet-500" />
          Schedule Rules
        </h3>
        <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full text-xs font-bold">
          {scheduleRules.length}
        </span>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        <AnimatePresence>
          {[...scheduleRules]
            .sort((a, b) => (a.date || "").localeCompare(b.date || ""))
            .map((rule, idx) => {
              const cfg = TYPE_CONFIG[rule.schedule_type] || TYPE_CONFIG.closed_day;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 16 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`group relative rounded-xl border p-3 flex items-start gap-3 ${cfg.bg} ${cfg.border}`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.badge}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-700">
                        {rule.date ? format(new Date(rule.date), "MMM d, yyyy") : "—"}
                      </span>
                    </div>
                    {(rule.start_time || rule.end_time) && (
                      <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {rule.start_time} – {rule.end_time}
                      </p>
                    )}
                    {rule.notes && (
                      <p className="text-xs text-gray-400 italic mt-0.5 truncate">{rule.notes}</p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(rule.id)}
                    disabled={loading}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-50 w-7 h-7"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              );
            })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}