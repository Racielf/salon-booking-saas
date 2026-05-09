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

// ── Behavior categories (derived from real appointment data only) ─────────────
export const BEHAVIOR_CATEGORIES = {
  reliable:       { key: "reliable",       label: "Reliable",        color: "green"  },
  needs_attention:{ key: "needs_attention",label: "Needs Attention",  color: "amber"  },
  at_risk:        { key: "at_risk",        label: "At Risk",         color: "red"    },
};

/**
 * Derives a behavior category from appointment history.
 * Uses only real status fields from the Appointment entity.
 *
 * @param {string} clientId
 * @param {Array}  appointments — full appointment list for the owner
 * @returns {{ behaviorCategory: object|null, riskFlags: string[], explanation: string }}
 */
export function getBehaviorCategory(clientId, appointments) {
  const all         = appointments.filter((a) => a.client_id === clientId);
  const completed   = all.filter((a) => a.status === "completed");
  const cancelled   = all.filter((a) => a.status === "cancelled");
  const noShows     = all.filter((a) => a.status === "no_show");

  const riskFlags = [];
  let behaviorCategory = null;
  let explanation = "";

  if (completed.length === 0) {
    // No completed visits yet — not enough data for a behavior category
    return { behaviorCategory: null, riskFlags, explanation: "No completed visits yet." };
  }

  // At Risk: has completed visits but last one was 30+ days ago
  const lastVisitDate = completed
    .map((a) => a.date)
    .filter(Boolean)
    .sort()
    .slice(-1)[0];
  const daysSinceVisit = lastVisitDate
    ? (Date.now() - new Date(lastVisitDate + "T12:00:00").getTime()) / 86400000
    : Infinity;

  if (daysSinceVisit >= 30) riskFlags.push("30+ days since last visit");
  if (noShows.length > 0)   riskFlags.push(`${noShows.length} no-show(s)`);
  if (cancelled.length >= 2) riskFlags.push(`${cancelled.length} cancellations`);

  // Determine category
  const totalBookings     = all.length;
  const cancellationRate  = totalBookings > 0 ? cancelled.length / totalBookings : 0;

  if (daysSinceVisit >= 30 && completed.length > 0) {
    behaviorCategory = BEHAVIOR_CATEGORIES.at_risk;
    explanation = `Last visit was ${Math.floor(daysSinceVisit)} days ago.`;
  } else if (noShows.length > 0 || cancelled.length >= 2) {
    behaviorCategory = BEHAVIOR_CATEGORIES.needs_attention;
    explanation = riskFlags.join(", ");
  } else if (completed.length >= 3 && noShows.length === 0 && cancellationRate < 0.25) {
    behaviorCategory = BEHAVIOR_CATEGORIES.reliable;
    explanation = `${completed.length} completed visits, low cancellation rate.`;
  }

  return { behaviorCategory, riskFlags, explanation };
}

/** Returns loyalty stats for a single client based on their appointments.
 *  All original fields preserved. behaviorCategory, riskFlags, explanation added. */
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
  const { behaviorCategory, riskFlags, explanation } = getBehaviorCategory(clientId, appointments);

  return {
    // ── Original fields (unchanged) ──
    totalAppointments: all.length,
    completedAppointments: completed.length,
    totalSpent,
    lastVisit,
    favService,
    level,
    // ── New behavior fields ──
    behaviorCategory,
    riskFlags,
    explanation,
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