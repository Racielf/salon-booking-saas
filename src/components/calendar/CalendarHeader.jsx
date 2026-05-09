import React from "react";
import { ChevronLeft, ChevronRight, Users, Scissors, Images, Settings, FileText, ScrollText } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/SettingsContext";
import UserMenu from "@/components/auth/UserMenu";

export default function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday }) {
  const { settings } = useSettings();
  const displayName = settings?.display_name || "YMY Pro";
  const logoUrl = settings?.logo_url;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm">
      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-4 px-6 py-3">
        <div className="flex items-center gap-2 shrink-0">
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className="w-8 h-8 rounded-xl object-cover" />
          ) : (
            <div className="bg-salon-gradient text-white px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5 shadow-salon-glow">
              <Scissors className="w-3.5 h-3.5" /> {displayName}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button onClick={onPrevMonth} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-base font-bold text-gray-800 px-2">{format(currentDate, "MMMM yyyy")}</span>
          <button onClick={onNextMonth} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button onClick={onToday} className="ml-1 px-4 py-1.5 bg-salon-gradient text-white text-xs font-bold rounded-full transition-all hover:opacity-90 shadow-salon-soft">
            Today
          </button>
        </div>

        <div className="flex-1" />

        <nav className="flex items-center gap-1">
          {[
            { to: "/clients", icon: Users, label: "Clients" },
            { to: "/services", icon: Scissors, label: "Services" },
            { to: "/estimates", icon: FileText, label: "Estimates" },
            { to: "/contracts", icon: ScrollText, label: "Contracts" },
            { to: "/gallery", icon: Images, label: "Gallery" },
            { to: "/settings", icon: Settings, label: "Settings" },
          ].map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-salon-soft text-sm font-semibold text-gray-600 hover:border-[#A855F7] hover:text-[#6366F1] transition-all"
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </Link>
          ))}
          <div className="ml-2">
            <UserMenu />
          </div>
        </nav>
      </div>

      {/* Mobile */}
      <div className="lg:hidden px-4 py-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="bg-salon-gradient text-white px-3 py-1.5 rounded-xl font-black text-sm flex items-center gap-1.5">
            <Scissors className="w-3.5 h-3.5" /> {displayName}
          </div>
          <UserMenu />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"><ChevronLeft className="w-3.5 h-3.5" /></button>
          <span className="text-sm font-bold text-gray-700 flex-1 text-center">{format(currentDate, "MMMM yyyy")}</span>
          <button onClick={onNextMonth} className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-500"><ChevronRight className="w-3.5 h-3.5" /></button>
          <button onClick={onToday} className="px-3 py-1 bg-salon-gradient text-white text-xs font-bold rounded-full transition-all hover:opacity-90">Today</button>
        </div>
      </div>
    </header>
  );
}
