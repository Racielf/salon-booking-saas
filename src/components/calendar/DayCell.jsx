import React from "react";
import { motion } from "framer-motion";
import { format, isToday, isSameMonth } from "date-fns";
import { cn } from "@/lib/utils";

export default function DayCell({ date, currentMonth, flexiDates = [], appointments = [], onClick }) {
  const dateString = format(date, "yyyy-MM-dd");
  const isCurrentMonth = isSameMonth(date, currentMonth);
  const isCurrentDay = isToday(date);
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Schedule rule indicators
  const isClosed = flexiDates.some((f) => f.date === dateString && f.schedule_type === "closed_day");
  const hasBlockedTime = flexiDates.some((f) => f.date === dateString && f.schedule_type === "block_time");
  const hasSpecialHours = flexiDates.some((f) => f.date === dateString && f.schedule_type === "special_hours");
  const isExtraWorking = flexiDates.some((f) => f.date === dateString && f.schedule_type === "extra_working_day");

  // Appointments for this day — exclude rejected/cancelled
  const dayAppointments = appointments.filter(
    (a) => a.date === dateString && a.status !== "rejected" && a.status !== "cancelled"
  );
  const confirmedCount = dayAppointments.filter(
    (a) => a.status === "confirmed" || a.status === "waiting_client_confirmation"
  ).length;
  const pendingCount = dayAppointments.filter((a) => a.status === "pending").length;

  return (
    <motion.div
      whileHover={{ scale: 1.02, zIndex: 10 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onClick(date)}
      className={cn(
        "relative min-h-[52px] sm:min-h-[80px] lg:min-h-[100px] p-1 sm:p-1.5 lg:p-2 rounded-xl cursor-pointer transition-all duration-200 select-none",
        "border-2 overflow-hidden",
        isClosed
          ? "bg-red-50/80 border-red-200 opacity-70"
          : isCurrentMonth
          ? isWeekend
            ? "bg-red-50/50"
            : "bg-white"
          : "bg-gray-50/50",
        isCurrentDay
          ? "border-violet-400 shadow-lg shadow-violet-200 ring-2 ring-violet-300"
          : isClosed
          ? "border-red-200"
          : hasSpecialHours
          ? "border-teal-200"
          : isExtraWorking
          ? "border-green-200"
          : isWeekend && isCurrentMonth
          ? "border-red-100 hover:border-violet-200 hover:shadow-md"
          : "border-gray-100 hover:border-violet-200 hover:shadow-md",
        !isCurrentMonth && "opacity-40"
      )}
    >
      {/* Day number */}
      <div className="flex items-start justify-between">
        <span className={cn(
          "text-xs sm:text-sm lg:text-base font-bold w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center rounded-full",
          isCurrentDay
            ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white"
            : isClosed
            ? "text-red-400"
            : "text-gray-700"
        )}>
          {format(date, "d")}
        </span>

        {/* Schedule rule badge */}
        {(isClosed || hasSpecialHours || isExtraWorking) && (
          <span className={cn(
            "text-[8px] font-bold rounded px-1 leading-tight hidden sm:inline",
            isClosed        ? "bg-red-100 text-red-600"
            : hasSpecialHours ? "bg-teal-100 text-teal-700"
            :                   "bg-green-100 text-green-700"
          )}>
            {isClosed ? "CLOSED" : hasSpecialHours ? "SPECIAL" : "EXTRA"}
          </span>
        )}
      </div>

      {/* Appointments */}
      {dayAppointments.length > 0 && (
        <div className="mt-0.5 sm:mt-1 space-y-0.5">
          {/* Mobile: dots */}
          <div className="flex items-center gap-0.5 sm:hidden flex-wrap">
            {confirmedCount > 0 && <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />}
            {pendingCount   > 0 && <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
            {dayAppointments.length > 2 && (
              <span className="text-[8px] text-violet-500 font-bold">+{dayAppointments.length - 2}</span>
            )}
          </div>
          {/* Tablet+: text pills */}
          <div className="hidden sm:block space-y-0.5">
            {dayAppointments.slice(0, 2).map((appt, idx) => {
              const isPending = appt.status === "pending";
              return (
                <div
                  key={idx}
                  className={`text-[9px] sm:text-[10px] font-semibold truncate rounded px-1 py-0.5 ${
                    isPending ? "bg-amber-100 text-amber-700" : "bg-violet-100 text-violet-700"
                  }`}
                >
                  {isPending ? "⏳ " : "✓ "}{appt.time} · {appt.client_name}
                </div>
              );
            })}
            {dayAppointments.length > 2 && (
              <div className="text-[9px] text-fuchsia-500 font-medium">
                +{dayAppointments.length - 2} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Block time indicator */}
      {hasBlockedTime && (
        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-amber-400" title="Blocked time" />
      )}
    </motion.div>
  );
}
