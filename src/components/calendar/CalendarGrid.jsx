import React from "react";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import DayCell from "./DayCell";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ currentDate, flexiDates, appointments = [], onDayClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd   = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd   = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  // key changes on month navigation → re-triggers the grid entrance animation
  const gridKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-3 sm:p-6 border border-violet-100 overflow-hidden">
      {/* Weekday headers — staggered entrance */}
      <div className="grid grid-cols-7 border-b border-gray-100 mb-1">
        {WEEK_DAYS.map((day, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
            className={`py-2.5 text-center text-xs font-bold tracking-wide ${idx >= 5 ? "text-rose-400" : "text-gray-400"}`}
          >
            {day}
          </motion.div>
        ))}
      </div>

      {/* Day cells — re-animate on month change */}
      <AnimatePresence mode="wait">
        <motion.div
          key={gridKey}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.18, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid grid-cols-7 gap-1 p-2 sm:p-3"
        >
          {days.map((day, idx) => (
            <DayCell
              key={idx}
              date={day}
              currentMonth={currentDate}
              flexiDates={flexiDates}
              appointments={appointments}
              onClick={onDayClick}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
