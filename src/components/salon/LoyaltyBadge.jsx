import React from "react";
import { Crown, Star, Sparkles } from "lucide-react";

const STYLES = {
  new:     { bg: "bg-gray-100",   text: "text-gray-500",   icon: null,     label: "New Client" },
  regular: { bg: "bg-violet-100", text: "text-violet-600", icon: Star,     label: "Regular"    },
  vip:     { bg: "bg-amber-100",  text: "text-amber-600",  icon: Crown,    label: "VIP"        },
};

export default function LoyaltyBadge({ levelKey, size = "sm" }) {
  const style = STYLES[levelKey] || STYLES.new;
  const Icon = style.icon;
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  const px = size === "sm" ? "px-2 py-0.5" : "px-2.5 py-1";

  return (
    <span className={`inline-flex items-center gap-1 ${px} rounded-full font-bold ${textSize} ${style.bg} ${style.text}`}>
      {Icon && <Icon className={iconSize} />}
      {style.label}
    </span>
  );
}