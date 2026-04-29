import React from "react";
import { CalendarCheck, DollarSign, Clock, Scissors } from "lucide-react";
import { format } from "date-fns";
import LoyaltyBadge from "./LoyaltyBadge";

export default function ClientLoyaltyStats({ stats }) {
  const { totalAppointments, completedAppointments, totalSpent, lastVisit, favService, level } = stats;

  return (
    <div className="space-y-2">
      {/* Badge */}
      <div className="flex items-center justify-between">
        <LoyaltyBadge levelKey={level.key} size="sm" />
        <span className="text-[10px] text-gray-400">{completedAppointments} completed</span>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5">
        <div className="flex items-center gap-1.5 bg-violet-50 rounded-lg px-2 py-1.5">
          <CalendarCheck className="w-3 h-3 text-violet-400 shrink-0" />
          <div>
            <p className="text-[10px] text-violet-400 leading-none">Total</p>
            <p className="text-xs font-bold text-violet-700">{totalAppointments}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-green-50 rounded-lg px-2 py-1.5">
          <DollarSign className="w-3 h-3 text-green-500 shrink-0" />
          <div>
            <p className="text-[10px] text-green-500 leading-none">Spent</p>
            <p className="text-xs font-bold text-green-700">${totalSpent}</p>
          </div>
        </div>
        {lastVisit && (
          <div className="flex items-center gap-1.5 bg-fuchsia-50 rounded-lg px-2 py-1.5">
            <Clock className="w-3 h-3 text-fuchsia-400 shrink-0" />
            <div>
              <p className="text-[10px] text-fuchsia-400 leading-none">Last visit</p>
              <p className="text-xs font-bold text-fuchsia-700">
                {format(new Date(lastVisit + "T12:00:00"), "MMM d")}
              </p>
            </div>
          </div>
        )}
        {favService && (
          <div className="flex items-center gap-1.5 bg-orange-50 rounded-lg px-2 py-1.5">
            <Scissors className="w-3 h-3 text-orange-400 shrink-0" />
            <div>
              <p className="text-[10px] text-orange-400 leading-none">Fav. service</p>
              <p className="text-xs font-bold text-orange-700 truncate max-w-[72px]">{favService}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}