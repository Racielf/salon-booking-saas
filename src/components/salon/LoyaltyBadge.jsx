import React from "react";
import { Crown, Star, ShieldCheck, AlertTriangle, TrendingDown } from "lucide-react";

// ── Loyalty level styles (Luxe Aurora palette) ──────────────────────────────
const LEVEL_STYLES = {
  new:     { bg: "bg-[#F1F5F9]", text: "text-[#64748B]", icon: null,  label: "New Client" },
  regular: { bg: "bg-[#EEF2FF]", text: "text-[#6366F1]", icon: Star,  label: "Regular" },
  vip:     { bg: "bg-[#FAE8FF]", text: "text-[#A855F7]", icon: Crown, label: "VIP" },
};

// ── Behavior category styles ─────────────────────────────────────────────────
const BEHAVIOR_STYLES = {
  reliable:        { bg: "bg-teal-100",  text: "text-teal-600",  icon: ShieldCheck,   label: "Reliable" },
  needs_attention: { bg: "bg-amber-100", text: "text-amber-600", icon: AlertTriangle, label: "Needs Attention" },
  at_risk:         { bg: "bg-red-100",   text: "text-red-500",   icon: TrendingDown,  label: "At Risk" },
};

export default function LoyaltyBadge({ levelKey, behaviorKey, size = "sm" }) {
  const style = LEVEL_STYLES[levelKey] || LEVEL_STYLES.new;
  const LevelIcon = style.icon;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  const bStyle = behaviorKey ? BEHAVIOR_STYLES[behaviorKey] : null;
  const BIcon = bStyle?.icon;

  return (
    <span className="inline-flex items-center gap-1.5 flex-wrap">
      <span className={`inline-flex items-center gap-1 rounded-full font-bold ${style.bg} ${style.text} ${textSize} ${px}`}>
        {LevelIcon && <LevelIcon className={iconSize} />}
        {style.label}
      </span>
      {bStyle && (
        <span className={`inline-flex items-center gap-1 rounded-full font-bold ${bStyle.bg} ${bStyle.text} ${textSize} ${px}`}>
          {BIcon && <BIcon className={iconSize} />}
          {bStyle.label}
        </span>
      )}
    </span>
  );
}
