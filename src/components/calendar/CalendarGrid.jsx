import React from "react";
import { motion } from "framer-motion";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
} from "date-fns";
import DayCell from "./DayCell";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarGrid({ currentDate, flexiDates, appointments = [], onDayClick }) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-3 sm:p-6 border border-violet-100">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 sm:mb-4">
        {weekDays.map((day, idx) => (
          <motion.div
            key={day}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className={`text-center py-2 sm:py-3 font-bold text-xs sm:text-sm rounded-xl ${
              idx === 5 || idx === 6
                ? "bg-gradient-to-r from-red-100 to-red-50 text-red-600"
                : "bg-gradient-to-r from-violet-100 to-fuchsia-50 text-violet-600"
            }`}
          >
            {day}
          </motion.div>
        ))}
      </div>

      {/* Calendar days */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-7 gap-1 sm:gap-2"
      >
        {days.map((day, idx) => (
          <motion.div
            key={format(day, "yyyy-MM-dd")}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.01 }}
          >
            <DayCell
              date={day}
              currentMonth={currentDate}
              flexiDates={flexiDates}
              appointments={appointments}
              onClick={onDayClick}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}