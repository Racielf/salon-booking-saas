import React, { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell, CheckCircle2, XCircle, Clock, AlertTriangle,
  Users, Scissors, DollarSign, CalendarCheck, Activity,
  UserPlus, CalendarX, CheckCheck, UserX, Crown, RefreshCw,
  MessageCircle, Send, HourglassIcon, PhoneOff,
} from "lucide-react";
import { formatDuration } from "@/lib/duration";
import { getClientStats, isInactive } from "@/lib/loyaltyUtils";
import LoyaltyBadge from "./LoyaltyBadge";

/* ─── helpers ─── */
function todayStr() {
  return format(new Date(), "yyyy-MM-dd");
}
function timeLabel(appt) {
  if (!appt.time) return "";
  const [h, m] = appt.time.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${suffix}`;
}
function fmtDate(dateStr) {
  return format(new Date(dateStr + "T12:00:00"), "MMMM d, yyyy");
}
function buildWhatsAppLink(phone, appt) {
  const clean = phone.replace(/\D/g, "");
  const services = (appt.service_names || []).join(", ") || "your appointment";
  const msg = `Hi ${appt.client_name}, this is a reminder for your appointment on ${fmtDate(appt.date)} at ${appt.time} for ${services}. Please reply to confirm. Thank you!`;
  return `https://wa.me/${clean}?text=${encodeURIComponent(msg)}`;
}

/* ─── sub-components ─── */
function SectionTitle({ icon: Icon, label, color = "violet" }) {
  const colors = {
    violet: "from-violet-500 to-fuchsia-500",
    amber: "from-amber-400 to-orange-500",
    teal: "from-teal-400 to-cyan-500",
    blue: "from-blue-400 to-cyan-500",
  };
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${colors[color] || colors.violet} flex items-center justify-center`}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <h3 className="font-bold text-gray-700 text-sm">{label}</h3>
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`bg-white/70 backdrop-blur rounded-2xl p-4 shadow-sm border border-white ${className}`}>
      {children}
    </div>
  );
}

/* ─── Pending request card ─── */
function PendingCard({ appt, onAccept, onReject, accepting, rejecting }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{appt.client_name || "Unknown"}</p>
          <p className="text-xs text-gray-500 truncate">{(appt.service_names || []).join(", ") || "—"}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-xs text-amber-600 font-medium">
              {appt.date ? format(new Date(appt.date + "T00:00:00"), "MMM d") : ""}
              {appt.time ? ` at ${timeLabel(appt)}` : ""}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full">PENDING</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onAccept(appt)} disabled={accepting || rejecting}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors disabled:opacity-50">
          <CheckCircle2 className="w-3.5 h-3.5" /> Accept
        </button>
        <button onClick={() => onReject(appt)} disabled={accepting || rejecting}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 text-xs font-bold transition-colors disabled:opacity-50">
          <XCircle className="w-3.5 h-3.5" /> Reject
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Upcoming row with reminder + complete/no-show ─── */
function UpcomingRow({ appt, clientPhone, onComplete, onNoShow, onReminderSent, updating }) {
  const reminderSent = appt.reminder_status === "sent";
  const whatsappUrl = clientPhone ? buildWhatsAppLink(clientPhone, appt) : null;

  const handleSendReminder = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
      onReminderSent(appt);
    }
  };

  return (
    <div className="py-2 border-b border-gray-100 last:border-0">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">{appt.client_name}</p>
          <p className="text-xs text-gray-400 truncate">{(appt.service_names || []).join(", ")}</p>
        </div>
        <span className="text-xs font-bold text-violet-600 shrink-0 mr-1">{timeLabel(appt)}</span>
        <div className="flex gap-1 shrink-0">
          <button onClick={() => onComplete(appt)} disabled={updating} title="Mark completed"
            className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center text-green-600 transition-colors disabled:opacity-50">
            <CheckCheck className="w-3 h-3" />
          </button>
          <button onClick={() => onNoShow(appt)} disabled={updating} title="Mark no-show"
            className="w-6 h-6 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50">
            <UserX className="w-3 h-3" />
          </button>
        </div>
      </div>
      {/* Reminder row */}
      <div className="flex items-center justify-between mt-1.5 pl-4">
        {reminderSent ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
            <Send className="w-2.5 h-2.5" /> Reminder Sent
          </span>
        ) : whatsappUrl ? (
          <button onClick={handleSendReminder}
            className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full transition-colors">
            <MessageCircle className="w-2.5 h-2.5" /> Send Reminder
          </button>
        ) : (
          <span className="text-[10px] text-gray-300 flex items-center gap-1">
            <PhoneOff className="w-2.5 h-2.5" /> No phone
          </span>
        )}
        {appt.status === "waiting_client_confirmation" && (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
            <HourglassIcon className="w-2.5 h-2.5" /> Awaiting Confirm
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Waiting confirmation row ─── */
function WaitingConfirmRow({ appt, clientPhone, onConfirm, onNoShow, onReminderSent, updating }) {
  const whatsappUrl = clientPhone ? buildWhatsAppLink(clientPhone, appt) : null;
  const reminderSent = appt.reminder_status === "sent";

  const handleSendReminder = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, "_blank");
      onReminderSent(appt);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-2">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-800 text-sm truncate">{appt.client_name}</p>
          <p className="text-xs text-gray-500 truncate">{(appt.service_names || []).join(", ") || "—"}</p>
          <div className="flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3 text-blue-400" />
            <span className="text-xs text-blue-600 font-medium">
              {appt.date ? format(new Date(appt.date + "T00:00:00"), "MMM d") : ""}
              {appt.time ? ` at ${timeLabel(appt)}` : ""}
            </span>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold bg-blue-200 text-blue-700 px-2 py-0.5 rounded-full">AWAITING</span>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onConfirm(appt)} disabled={updating}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-colors disabled:opacity-50">
          <CheckCircle2 className="w-3.5 h-3.5" /> Confirm
        </button>
        {whatsappUrl && !reminderSent && (
          <button onClick={handleSendReminder}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 text-xs font-bold transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> Remind
          </button>
        )}
        {reminderSent && (
          <span className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-green-50 text-green-600 text-xs font-semibold">
            <Send className="w-3 h-3" /> Sent
          </span>
        )}
        <button onClick={() => onNoShow(appt)} disabled={updating}
          className="flex items-center justify-center gap-1 py-1.5 px-2.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-500 text-xs font-bold transition-colors disabled:opacity-50">
          <UserX className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

/* ─── Activity item ─── */
function ActivityItem({ icon: Icon, color, text, time }) {
  const colorMap = {
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-500",
    violet: "bg-violet-100 text-violet-600",
    amber: "bg-amber-100 text-amber-600",
    teal: "bg-teal-100 text-teal-600",
    blue: "bg-blue-100 text-blue-600",
  };
  return (
    <div className="flex items-start gap-2 py-2 border-b border-gray-100 last:border-0">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${colorMap[color] || colorMap.violet}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700">{text}</p>
        <p className="text-[10px] text-gray-400">{time}</p>
      </div>
    </div>
  );
}

/* ─── Main ─── */
export default function SalonControlCenter({ appointments = [], clients = [], services = [] }) {
  const queryClient = useQueryClient();
  const today = todayStr();

  // Auto-refresh every 30s
  useEffect(() => {
    const id = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    }, 30000);
    return () => clearInterval(id);
  }, [queryClient]);

  // Client phone lookup map
  const clientPhoneMap = {};
  clients.forEach((c) => { if (c.phone) clientPhoneMap[c.id] = c.phone; });

  /* ── derived data ── */
  const todayAppts = appointments.filter((a) => a.date === today);

  const pendingAppts = appointments
    .filter((a) => a.status === "pending")
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""))
    .slice(0, 8);

  const confirmedToday = todayAppts.filter((a) => a.status === "confirmed");
  const upcomingToday = confirmedToday
    .filter((a) => a.time)
    .sort((a, b) => a.time.localeCompare(b.time))
    .slice(0, 5);

  // Appointments waiting for client confirmation (all upcoming, not just today)
  const waitingConfirmation = appointments
    .filter((a) => a.status === "waiting_client_confirmation")
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""))
    .slice(0, 5);

  // Reminders needed today: confirmed today, reminder not sent yet
  const remindersNeededToday = confirmedToday.filter((a) => a.reminder_status !== "sent");

  const uniqueClientsToday = new Set(todayAppts.map((a) => a.client_id)).size;
  const totalServicesToday = confirmedToday.reduce((s, a) => s + (a.service_names?.length || 0), 0);
  const revenueToday = todayAppts
    .filter((a) => a.status === "confirmed" || a.status === "completed" || a.status === "waiting_client_confirmation")
    .reduce((s, a) => s + (a.total_price || 0), 0);

  // No-show count this month
  const now = new Date();
  const startOfMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const noShowThisMonth = appointments.filter((a) => a.status === "no_show" && a.date >= startOfMonth).length;

  /* ── mutations ── */
  const acceptMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { status: "confirmed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { status: "rejected" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const completeMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { status: "completed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const noShowMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { status: "no_show" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const confirmMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { status: "confirmed" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
  const reminderSentMutation = useMutation({
    mutationFn: (appt) => base44.entities.Appointment.update(appt.id, { reminder_status: "sent" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  const statusUpdating = completeMutation.isPending || noShowMutation.isPending || confirmMutation.isPending;

  /* ── loyalty stats ── */
  const vipClients = clients.filter((c) => getClientStats(c.id, appointments).level.key === "vip");
  const returningClients = clients.filter((c) => getClientStats(c.id, appointments).completedAppointments >= 2);
  const newThisMonth = clients.filter((c) => c.created_date && c.created_date.slice(0, 10) >= startOfMonth);

  const newVipAlerts = clients.filter((c) => {
    const stats = getClientStats(c.id, appointments);
    if (stats.level.key !== "vip" || stats.completedAppointments !== 8) return false;
    if (!stats.lastVisit) return false;
    const diff = (Date.now() - new Date(stats.lastVisit + "T12:00:00").getTime()) / 86400000;
    return diff <= 3;
  });

  const inactiveClients = clients.filter((c) => isInactive(c.id, appointments));

  /* ── recent activity ── */
  const recentActivity = [];
  const statusInfo = {
    confirmed: { icon: CalendarCheck, color: "green", label: "confirmed" },
    rejected: { icon: CalendarX, color: "red", label: "rejected" },
    completed: { icon: CheckCheck, color: "teal", label: "completed" },
    no_show: { icon: UserX, color: "amber", label: "no-show" },
    pending: { icon: CalendarCheck, color: "violet", label: "requested" },
    waiting_client_confirmation: { icon: HourglassIcon, color: "blue", label: "awaiting confirmation" },
    cancelled: { icon: CalendarX, color: "red", label: "cancelled" },
  };

  // Include reminder_status=sent in activity
  const remindersInActivity = [...appointments]
    .filter((a) => a.reminder_status === "sent")
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 2)
    .map((a) => ({
      icon: Send, color: "green",
      text: `Reminder sent to ${a.client_name} for ${a.date ? format(new Date(a.date + "T00:00:00"), "MMM d") : ""}`,
      time: a.updated_date ? format(new Date(a.updated_date), "MMM d, h:mm a") : "",
    }));

  [...appointments]
    .sort((a, b) => new Date(b.updated_date || b.created_date) - new Date(a.updated_date || a.created_date))
    .slice(0, 4)
    .forEach((a) => {
      const info = statusInfo[a.status] || { icon: CalendarCheck, color: "violet", label: a.status };
      recentActivity.push({
        icon: info.icon, color: info.color,
        text: `Appointment ${info.label} — ${a.client_name}`,
        time: a.updated_date ? format(new Date(a.updated_date), "MMM d, h:mm a") : "",
      });
    });

  [...clients]
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 2)
    .forEach((c) => {
      recentActivity.push({ icon: UserPlus, color: "teal", text: `New client: ${c.name}`, time: c.created_date ? format(new Date(c.created_date), "MMM d, h:mm a") : "" });
    });

  [...remindersInActivity].forEach((r) => recentActivity.push(r));
  recentActivity.sort((a, b) => b.time.localeCompare(a.time));

  /* ── alerts ── */
  const alerts = [];
  if (services.length === 0) alerts.push("No services yet — add services to enable booking.");
  if (clients.length === 0) alerts.push("No clients yet — add clients to book appointments.");

  return (
    <div className="space-y-4">

      {/* ── Notifications ── */}
      <Card>
        <SectionTitle icon={Bell} label="Notifications" color="amber" />

        {pendingAppts.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Pending Requests ({pendingAppts.length})</p>
            <AnimatePresence>
              {pendingAppts.map((appt) => (
                <PendingCard key={appt.id} appt={appt}
                  onAccept={(a) => acceptMutation.mutate(a)}
                  onReject={(a) => rejectMutation.mutate(a)}
                  accepting={acceptMutation.isPending}
                  rejecting={rejectMutation.isPending}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {alerts.length > 0 && (
          <div className="mb-3">
            {alerts.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-600">{msg}</p>
              </div>
            ))}
          </div>
        )}

        {upcomingToday.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Upcoming Today</p>
            {upcomingToday.map((a) => (
              <UpcomingRow key={a.id} appt={a}
                clientPhone={clientPhoneMap[a.client_id]}
                onComplete={(ap) => completeMutation.mutate(ap)}
                onNoShow={(ap) => noShowMutation.mutate(ap)}
                onReminderSent={(ap) => reminderSentMutation.mutate(ap)}
                updating={statusUpdating}
              />
            ))}
          </div>
        )}

        {newVipAlerts.length > 0 && (
          <div className="mb-3">
            {newVipAlerts.map((c) => (
              <div key={c.id} className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-2">
                <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700 font-semibold"><span className="font-black">{c.name}</span> just became a VIP client! 🎉</p>
              </div>
            ))}
          </div>
        )}

        {inactiveClients.length > 0 && (
          <div className="mb-3">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wide mb-2">Haven't Visited in 30+ Days</p>
            {inactiveClients.slice(0, 3).map((c) => {
              const stats = getClientStats(c.id, appointments);
              return (
                <div key={c.id} className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2 mb-1.5">
                  <RefreshCw className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-700 truncate">{c.name}</p>
                    <p className="text-[10px] text-blue-400">Last: {stats.lastVisit ? format(new Date(stats.lastVisit + "T12:00:00"), "MMM d") : "—"}</p>
                  </div>
                  <LoyaltyBadge levelKey={stats.level.key} size="sm" />
                </div>
              );
            })}
            {inactiveClients.length > 3 && (
              <p className="text-[10px] text-gray-400 text-center">+{inactiveClients.length - 3} more</p>
            )}
          </div>
        )}

        {pendingAppts.length === 0 && alerts.length === 0 && upcomingToday.length === 0 && newVipAlerts.length === 0 && inactiveClients.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-3">All clear — no notifications</p>
        )}
      </Card>

      {/* ── Pending Confirmations ── */}
      {waitingConfirmation.length > 0 && (
        <Card>
          <SectionTitle icon={HourglassIcon} label={`Pending Confirmations (${waitingConfirmation.length})`} color="blue" />
          <AnimatePresence>
            {waitingConfirmation.map((appt) => (
              <WaitingConfirmRow
                key={appt.id}
                appt={appt}
                clientPhone={clientPhoneMap[appt.client_id]}
                onConfirm={(a) => confirmMutation.mutate(a)}
                onNoShow={(a) => noShowMutation.mutate(a)}
                onReminderSent={(a) => reminderSentMutation.mutate(a)}
                updating={statusUpdating}
              />
            ))}
          </AnimatePresence>
        </Card>
      )}

      {/* ── Today's Summary ── */}
      <Card>
        <SectionTitle icon={CalendarCheck} label="Today's Summary" color="teal" />
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-violet-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <CalendarCheck className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[11px] text-violet-500 font-semibold">Appointments</span>
            </div>
            <p className="text-2xl font-black text-violet-700">{todayAppts.length}</p>
          </div>
          <div className="bg-fuchsia-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Users className="w-3.5 h-3.5 text-fuchsia-500" />
              <span className="text-[11px] text-fuchsia-500 font-semibold">Clients</span>
            </div>
            <p className="text-2xl font-black text-fuchsia-700">{uniqueClientsToday}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Scissors className="w-3.5 h-3.5 text-orange-500" />
              <span className="text-[11px] text-orange-500 font-semibold">Services</span>
            </div>
            <p className="text-2xl font-black text-orange-700">{totalServicesToday}</p>
          </div>
          <div className="bg-green-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <DollarSign className="w-3.5 h-3.5 text-green-500" />
              <span className="text-[11px] text-green-500 font-semibold">Revenue</span>
            </div>
            <p className="text-2xl font-black text-green-700">${revenueToday}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Send className="w-3.5 h-3.5 text-emerald-500" />
              <span className="text-[11px] text-emerald-500 font-semibold">Reminders Needed</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">{remindersNeededToday.length}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <HourglassIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] text-blue-500 font-semibold">Waiting Confirm</span>
            </div>
            <p className="text-2xl font-black text-blue-700">{waitingConfirmation.length}</p>
          </div>
          <div className="bg-red-50 rounded-xl col-span-2 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <UserX className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[11px] text-red-400 font-semibold">No-shows This Month</span>
            </div>
            <p className="text-2xl font-black text-red-600">{noShowThisMonth}</p>
          </div>
        </div>
      </Card>

      {/* ── Client Loyalty Summary ── */}
      <Card>
        <SectionTitle icon={Crown} label="Client Loyalty" color="amber" />
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <Crown className="w-4 h-4 text-amber-500 mx-auto mb-1" />
            <p className="text-xl font-black text-amber-700">{vipClients.length}</p>
            <p className="text-[10px] text-amber-500 font-semibold">VIP</p>
          </div>
          <div className="bg-violet-50 rounded-xl p-3 text-center">
            <Users className="w-4 h-4 text-violet-500 mx-auto mb-1" />
            <p className="text-xl font-black text-violet-700">{returningClients.length}</p>
            <p className="text-[10px] text-violet-500 font-semibold">Returning</p>
          </div>
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <UserPlus className="w-4 h-4 text-teal-500 mx-auto mb-1" />
            <p className="text-xl font-black text-teal-700">{newThisMonth.length}</p>
            <p className="text-[10px] text-teal-500 font-semibold">New This Month</p>
          </div>
        </div>
      </Card>

      {/* ── Recent Activity ── */}
      <Card>
        <SectionTitle icon={Activity} label="Recent Activity" color="violet" />
        {recentActivity.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-3">No recent activity</p>
        ) : (
          recentActivity.slice(0, 7).map((item, i) => (
            <ActivityItem key={i} {...item} />
          ))
        )}
      </Card>

    </div>
  );
}