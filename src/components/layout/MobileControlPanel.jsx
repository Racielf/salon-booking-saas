import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Bell } from "lucide-react";
import SalonControlCenter from "@/components/salon/SalonControlCenter";
import ScheduleRuleList from "@/components/calendar/ScheduleRuleList";

export default function MobileControlPanel({ appointments, clients, services, scheduleRules, onDeleteRule, deletingRule }) {
  const [open, setOpen] = useState(false);
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <>
      {/* Slide-up trigger button */}
      <div className="lg:hidden fixed bottom-16 right-4 z-30">
        <button
          onClick={() => setOpen(true)}
          className="relative flex items-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white px-4 py-3 rounded-2xl shadow-xl shadow-violet-300/50 font-bold text-sm"
        >
          <Bell className="w-4 h-4" />
          <span>Control Panel</span>
          <ChevronUp className="w-4 h-4" />
          {pendingCount > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] font-black flex items-center justify-center">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Bottom sheet overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 rounded-t-3xl shadow-2xl lg:hidden max-h-[80vh] overflow-y-auto"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-violet-100">
                <h2 className="font-black text-gray-800 text-lg">Control Panel</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-white/70 text-gray-500 hover:bg-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-4 pb-8 space-y-4">
                <SalonControlCenter appointments={appointments} clients={clients} services={services} />
                <ScheduleRuleList scheduleRules={scheduleRules} onDelete={onDeleteRule} loading={deletingRule} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}