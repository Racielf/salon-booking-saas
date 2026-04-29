/**
 * Client loyalty system utilities.
 * All calculations are based on completed appointments only.
 */

export const LOYALTY_LEVELS = [
  { key: "new",     label: "New Client",     min: 0, max: 2,  color: "gray"   },
  { key: "regular", label: "Regular",         min: 3, max: 7,  color: "violet" },
  { key: "vip",     label: "VIP Client",      min: 8, max: Infinity, color: "amber" },
];

export function getLoyaltyLevel(completedCount) {
  return (
    LOYALTY_LEVELS.find((l) => completedCount >= l.min && completedCount <= l.max) ||
    LOYALTY_LEVELS[0]
  );
}

/** Returns loyalty stats for a single client based on their appointments */
export function getClientStats(clientId, appointments) {
  const all = appointments.filter((a) => a.client_id === clientId);
  const completed = all.filter((a) => a.status === "completed");

  const totalSpent = completed.reduce((sum, a) => sum + (a.total_price || 0), 0);

  // Last visit: latest date among completed appointments
  const lastVisit = completed
    .map((a) => a.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || null;

  // Favourite service: most frequent service_name in completed appointments
  const svcCount = {};
  completed.forEach((a) => {
    (a.service_names || []).forEach((name) => {
      svcCount[name] = (svcCount[name] || 0) + 1;
    });
  });
  const favService = Object.keys(svcCount).sort((a, b) => svcCount[b] - svcCount[a])[0] || null;

  const level = getLoyaltyLevel(completed.length);

  return {
    totalAppointments: all.length,
    completedAppointments: completed.length,
    totalSpent,
    lastVisit,
    favService,
    level,
  };
}

/** Returns true if client hasn't visited in 30+ days (based on completed appts) */
export function isInactive(clientId, appointments) {
  const completed = appointments.filter(
    (a) => a.client_id === clientId && a.status === "completed"
  );
  if (completed.length === 0) return false; // new client — not "inactive"
  const lastDate = completed
    .map((a) => a.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];
  if (!lastDate) return false;
  const diffDays = (Date.now() - new Date(lastDate + "T12:00:00").getTime()) / 86400000;
  return diffDays >= 30;
}