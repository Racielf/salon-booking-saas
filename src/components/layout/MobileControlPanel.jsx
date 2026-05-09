import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";
import SalonControlCenter from "@/components/salon/SalonControlCenter";
import ScheduleRuleList from "@/components/calendar/ScheduleRuleList";

export default function MobileControlPanel({ appointments, clients, services, scheduleRules, onDeleteRule, deletingRule }) {
  const [open, setOpen] = useState(false);
  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <>
      {/* Trigger — fixed mobile-only, bottom-16 right-4 */}
      <motion.button
        onClick={() => setOpen(true)}
        className="fixed bottom-16 right-4 z-30 lg:hidden flex items-center gap-2 bg-salon-gradient text-white px-4 py-3 rounded-2xl shadow-salon-soft font-bold text-sm"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <ChevronUp className="w-4 h-4" />
        Control Panel
        {pendingCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
            {pendingCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            />
            {/* Sheet — Zetta spring */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto lg:hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">Control Panel</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ✕
                </button>
              </div>
              <SalonControlCenter appointments={appointments} clients={clients} services={services} />
              <ScheduleRuleList scheduleRules={scheduleRules} onDelete={onDeleteRule} loading={deletingRule} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
