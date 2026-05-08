import React from "react";
import { format } from "date-fns";
import LoyaltyBadge from "./LoyaltyBadge";

export default function ClientLoyaltyStats({ stats }) {
  const {
    totalAppointments, completedAppointments, totalSpent,
    lastVisit, favService, level,
    behaviorCategory = null,
    riskFlags = [],
  } = stats;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <LoyaltyBadge levelKey={level.key} behaviorKey={behaviorCategory?.key || null} />
        <span className="text-xs text-gray-400">{completedAppointments} completed</span>
      </div>

      {riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {riskFlags.map((flag) => (
            <span key={flag} className="text-[10px] bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-semibold">
              ⚠ {flag}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
          <p className="text-[#94A3B8]">Total</p>
          <p className="font-bold text-[#0F172A]">{totalAppointments}</p>
        </div>
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
          <p className="text-[#94A3B8]">Spent</p>
          <p className="font-bold text-[#0F172A]">${totalSpent}</p>
        </div>
        {lastVisit && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
            <p className="text-[#94A3B8]">Last visit</p>
            <p className="font-bold text-[#0F172A]">{format(new Date(lastVisit + "T12:00:00"), "MMM d")}</p>
          </div>
        )}
        {favService && (
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2">
            <p className="text-[#94A3B8]">Fav. service</p>
            <p className="font-bold text-[#0F172A] truncate">{favService}</p>
          </div>
        )}
      </div>
    </div>
  );
}
