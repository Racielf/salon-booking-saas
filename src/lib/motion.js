// ── SalonFlow motion constants (Zetta Polish) ────────────────────────────────
// Premium SaaS — smooth, fast, elegant. No heavy bounce. No childish animations.

export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -10 },
  transition: { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] },
};

export const cardMotion = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, scale: 0.97 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } },
};

export const modalMotion = {
  mobile: {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit:    { y: "100%", opacity: 0 },
    transition: { type: "spring", damping: 28, stiffness: 300 },
  },
  desktop: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit:    { opacity: 0, scale: 0.97 },
    transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.2 },
};

export const buttonTap = {
  whileHover: { scale: 1.02 },
  whileTap:   { scale: 0.97 },
  transition: { type: "spring", stiffness: 400, damping: 22 },
};

// Zetta-style day cell entrance: scale from 0.8 → 1, opacity 0 → 1
// Used in CalendarGrid with idx * 0.01 delay per cell
export const zettaDay = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] },
};
