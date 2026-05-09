import React from "react";
import { format, startOfMonth } from "date-fns";
import { AlertTriangle, Bell, CalendarCheck, Users, Scissors, DollarSign, Bell as BellIcon, Clock, TrendingDown, Crown, UserCheck, CalendarPlus } from "lucide-react";
import { getClientStats } from "@/lib/loyaltyUtils";

function SectionCard({ icon: Icon, iconColor, iconBg, title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        </div>
        <span className="font-bold text-gray-700 text-sm">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatBox({ icon: Icon, iconColor, iconBg, label, value, valueColor = "text-gray-800" }) {
  return (
    <div className={`rounded-xl p-3 ${iconBg} flex flex-col gap-1`}>
      <div className="flex items-center gap-1.5">
        <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
        <span className="text-xs text-gray-500 font-medium">{label}</span>
      </div>
      <span className={`text-xl font-black ${valueColor}`}>{value}</span>
    </div>
  );
}

export default function DashboardSidebar({ appointments = [], clients = [], services = [] }) {
  const today = format(new Date(), "yyyy-MM-dd");
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");

  const todayAppts = appointments.filter((a) => a.date === today && !["cancelled", "rejected"].includes(a.status));
  const confirmedToday = todayAppts.filter((a) => ["confirmed", "completed", "waiting_client_confirmation"].includes(a.status));
  const revenueToday = confirmedToday.reduce((s, a) => s + (a.total_price || 0), 0);
  const remindersNeeded = appointments.filter((a) => a.date >= today && a.status === "confirmed" && a.reminder_status !== "sent").length;
  const waitingConfirm = appointments.filter((a) => a.status === "waiting_client_confirmation").length;
  const noShowMonth = appointments.filter((a) => a.status === "no_show" && a.date >= monthStart).length;

  const alerts = [];
  if (services.length === 0) alerts.push({ msg: "No services yet — add services to enable booking.", color: "bg-orange-50 text-orange-600 border-orange-100" });
  if (clients.length === 0) alerts.push({ msg: "No clients yet — add clients to book appointments.", color: "bg-pink-50 text-pink-600 border-pink-100" });

  const vipCount = clients.filter((c) => getClientStats(c.id, appointments).level?.key === "vip").length;
  const returningCount = clients.filter((c) => {
    const stats = getClientStats(c.id, appointments);
    return stats.completedAppointments >= 2 && stats.level?.key !== "vip";
  }).length;
  const thisMonthNew = clients.filter((c) => {
    const d = c.created_date;
    return d && d.slice(0, 7) === format(now, "yyyy-MM");
  }).length;

  return (
    <div className="space-y-4">
      <SectionCard icon={Bell} iconColor="text-amber-500" iconBg="bg-amber-50" title="Notifications">
        {alerts.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-2">All good — no alerts!</p>
        ) : (
          <div className="space-y-2">
            {alerts.map((a, i) => (
              <div key={i} className={`flex items-start gap-2 text-xs px-3 py-2 rounded-xl border ${a.color}`}>
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                {a.msg}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard icon={CalendarCheck} iconColor="text-[#6366F1]" iconBg="bg-[#EEF2FF]" title="Today's Summary">
        <div className="grid grid-cols-2 gap-2">
          <StatBox icon={CalendarCheck} iconColor="text-[#6366F1]" iconBg="bg-[#EEF2FF]" label="Appointments" value={confirmedToday.length} />
          <StatBox icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50" label="Clients" value={new Set(confirmedToday.map((a) => a.client_id)).size} />
          <StatBox icon={Scissors} iconColor="text-orange-500" iconBg="bg-orange-50" label="Services" value={services.length} />
          <StatBox icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" label="Revenue" value={`$${revenueToday}`} valueColor="text-green-700" />
          <StatBox icon={BellIcon} iconColor="text-yellow-500" iconBg="bg-yellow-50" label="Reminders Needed" value={remindersNeeded} />
          <StatBox icon={Clock} iconColor="text-sky-500" iconBg="bg-sky-50" label="Waiting Confirm" value={waitingConfirm} />
        </div>
        {noShowMonth > 0 && (
          <div className="mt-2">
            <StatBox icon={TrendingDown} iconColor="text-red-500" iconBg="bg-red-50" label="No-shows This Month" value={noShowMonth} valueColor="text-red-600" />
          </div>
        )}
      </SectionCard>

      <SectionCard icon={Crown} iconColor="text-amber-500" iconBg="bg-amber-50" title="Client Loyalty">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-amber-50 rounded-xl p-3">
            <Crown className="w-5 h-5 text-amber-400 mx-auto mb-1" />
            <p className="text-xl font-black text-gray-800">{vipCount}</p>
            <p className="text-[10px] text-gray-400 font-semibold">VIP</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <UserCheck className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xl font-black text-gray-800">{returningCount}</p>
            <p className="text-[10px] text-gray-400 font-semibold">Returning</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <CalendarPlus className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xl font-black text-gray-800">{thisMonthNew}</p>
            <p className="text-[10px] text-gray-400 font-semibold">New This Month</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
