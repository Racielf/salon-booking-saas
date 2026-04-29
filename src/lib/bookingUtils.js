/**
 * Shared booking utility functions used by both the admin portal and public booking portal.
 * Single source of truth for slot availability logic.
 */

export const DAY_KEYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Returns true if the appointment status is "active" (blocks time slots).
 * pending, confirmed, waiting_client_confirmation all block slots.
 * completed and no_show do NOT block (the time has already passed).
 * rejected and cancelled do NOT block.
 */
export function isActiveStatus(status) {
  return status === "pending" || status === "confirmed" || status === "waiting_client_confirmation";
}

/**
 * Check if a time slot is occupied given the existing appointments.
 * Both confirmed AND pending appointments block slots.
 */
export function isSlotOccupied(slot, dateStr, appointments, totalDuration) {
  const [slotH, slotM] = slot.split(":").map(Number);
  const slotStart = slotH * 60 + slotM;
  const slotEnd = slotStart + (totalDuration || 30);

  return appointments
    .filter((a) => a.date === dateStr && isActiveStatus(a.status))
    .some((a) => {
      if (!a.time) return false;
      const [aH, aM] = a.time.split(":").map(Number);
      const aStart = aH * 60 + aM;
      const aEnd = aStart + (a.duration_total || 30);
      return slotStart < aEnd && slotEnd > aStart;
    });
}

/**
 * Check if a slot falls within a blocked time range.
 */
function isSlotBlocked(slot, dateStr, flexiDates, totalDuration) {
  const [slotH, slotM] = slot.split(":").map(Number);
  const slotStart = slotH * 60 + slotM;
  const slotEnd = slotStart + (totalDuration || 30);

  return flexiDates
    .filter((f) => f.date === dateStr && f.schedule_type === "block_time")
    .some((f) => {
      if (!f.start_time || !f.end_time) return false;
      const [bH, bM] = f.start_time.split(":").map(Number);
      const [eH, eM] = f.end_time.split(":").map(Number);
      const blockStart = bH * 60 + bM;
      const blockEnd = eH * 60 + eM;
      return slotStart < blockEnd && slotEnd > blockStart;
    });
}

/**
 * Generate available time slots for a given date, respecting:
 * - Business hours (open/close, break times, special_hours overrides)
 * - Closed days (closed_day flexi rule)
 * - Blocked time ranges
 * - Buffer time between appointments
 */
export function getTimeSlots(settings, date, flexiDates = [], appointments = [], totalDuration = 30) {
  const dateStr = typeof date === "string" ? date : formatDateStr(date);
  const dayKey = `hours_${DAY_KEYS[new Date(dateStr + "T12:00:00").getDay()]}`;

  // Check for closed_day flexi rule
  const isForcedClosed = flexiDates.some((f) => f.date === dateStr && f.schedule_type === "closed_day");
  if (isForcedClosed) return [];

  // Check for special_hours override
  const specialHours = flexiDates.find((f) => f.date === dateStr && f.schedule_type === "special_hours");

  let open, close, breakStart, breakEnd;

  if (specialHours) {
    open = specialHours.start_time || "09:00";
    close = specialHours.end_time || "18:00";
    breakStart = null;
    breakEnd = null;
  } else {
    const hours = settings[dayKey];
    if (hours && hours.open === false) return [];
    // Fallback defaults if not configured
    open = hours?.start || "09:00";
    close = hours?.end || "18:00";
    breakStart = hours?.break_start || null;
    breakEnd = hours?.break_end || null;
  }

  const interval = settings.slot_interval || 30;
  const buffer = settings.buffer_time || 0;

  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };
  const toStr = (min) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const startTotal = toMin(open);
  const endTotal = toMin(close);
  const bStart = breakStart ? toMin(breakStart) : null;
  const bEnd = breakEnd ? toMin(breakEnd) : null;

  const slots = [];
  for (let t = startTotal; t + totalDuration <= endTotal; t += interval) {
    const slotStr = toStr(t);
    const slotEnd = t + totalDuration + buffer;

    // Skip break time
    if (bStart !== null && bEnd !== null) {
      if (t < bEnd && slotEnd > bStart) continue;
    }

    // Skip blocked ranges
    if (isSlotBlocked(slotStr, dateStr, flexiDates, totalDuration)) continue;

    // Skip occupied slots
    if (isSlotOccupied(slotStr, dateStr, appointments, totalDuration)) continue;

    slots.push(slotStr);
  }

  return slots;
}

/**
 * Check if a given date is available for booking.
 * Returns false if it's a closed day, forced closed, or extra_working_day handles it.
 */
export function isDayAvailable(date, settings, flexiDates = []) {
  const dateStr = formatDateStr(date);
  const dayOfWeek = new Date(dateStr + "T12:00:00").getDay();
  const dayKey = `hours_${DAY_KEYS[dayOfWeek]}`;

  // Forced closed by flexi rule
  if (flexiDates.some((f) => f.date === dateStr && f.schedule_type === "closed_day")) return false;

  // Special hours = open
  if (flexiDates.some((f) => f.date === dateStr && f.schedule_type === "special_hours")) return true;

  // Extra working day = open
  if (flexiDates.some((f) => f.date === dateStr && f.schedule_type === "extra_working_day")) return true;

  // Normal business hours
  const hours = settings?.[dayKey];
  if (hours === undefined || hours === null) {
    // Default: Mon-Sat open, Sun closed
    return dayOfWeek !== 0;
  }
  return hours?.open === true;
}

export function formatDateStr(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}