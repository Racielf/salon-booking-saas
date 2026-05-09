import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Sparkles, Users, Scissors, Images, Settings, FileText, ScrollText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/SettingsContext";
import UserMenu from "@/components/auth/UserMenu";

export default function CalendarHeader({ currentDate, onPrevMonth, onNextMonth, onToday }) {
  const { settings } = useSettings();
  const displayName = settings?.display_name || "YMY Pro";
  const logoUrl = settings?.logo_url;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 sm:mb-6"
    >
      {/* ── DESKTOP / TABLET: single unified navbar row ── */}
      <div className="hidden lg:flex items-center gap-3 mb-4">

        {/* Logo */}
        <div className="relative shrink-0">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40 animate-pulse" />
          <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-7 h-7 rounded-lg object-cover bg-white/20" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <h1 className="text-2xl font-black tracking-tight">{displayName}</h1>
          </div>
        </div>

        {/* Month navigator — center */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={onPrevMonth} className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50">
            <ChevronLeft className="w-5 h-5 text-violet-600" />
          </Button>
          <motion.div key={format(currentDate, "yyyy-MM")} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="min-w-[160px] text-center">
            <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </motion.div>
          <Button variant="outline" size="icon" onClick={onNextMonth} className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50">
            <ChevronRight className="w-5 h-5 text-violet-600" />
          </Button>
          <Button onClick={onToday} className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-full px-4 font-semibold shadow-lg shadow-teal-200">
            Today
          </Button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-violet-200 mx-1" />

        {/* Right-aligned nav links */}
        <nav className="ml-auto flex items-center gap-1.5">
          <Link to="/clients">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <Users className="w-4 h-4 text-violet-600" /> Clients
            </Button>
          </Link>
          <Link to="/services">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <Scissors className="w-4 h-4 text-violet-600" /> Services
            </Button>
          </Link>
          <Link to="/estimates">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <FileText className="w-4 h-4 text-violet-600" /> Estimates
            </Button>
          </Link>
          <Link to="/contracts">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <ScrollText className="w-4 h-4 text-violet-600" /> Contracts
            </Button>
          </Link>
          <Link to="/gallery">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <Images className="w-4 h-4 text-violet-600" /> Gallery
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="outline" className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 gap-2 font-semibold">
              <Settings className="w-4 h-4 text-violet-600" /> Settings
            </Button>
          </Link>
          <UserMenu />
        </nav>
      </div>

      {/* ── MOBILE: logo + user menu row, then month navigator ── */}
      <div className="lg:hidden">
        {/* Top row: logo + user menu */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40 animate-pulse" />
            <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-4 py-2.5 rounded-2xl flex items-center gap-2">
              {logoUrl ? (
                <img src={logoUrl} alt="logo" className="w-6 h-6 rounded-lg object-cover bg-white/20" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
              <h1 className="text-xl font-black tracking-tight">{displayName}</h1>
            </div>
          </div>
          <UserMenu />
        </div>

        {/* Month navigator */}
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={onPrevMonth} className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 h-10 w-10">
            <ChevronLeft className="w-5 h-5 text-violet-600" />
          </Button>
          <motion.div key={format(currentDate, "yyyy-MM")} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h2 className="text-lg font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
              {format(currentDate, "MMMM yyyy")}
            </h2>
          </motion.div>
          <div className="flex items-center gap-2">
            <Button onClick={onToday} size="sm" className="bg-gradient-to-r from-teal-400 to-cyan-500 text-white rounded-full px-3 font-semibold text-xs h-9">
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={onNextMonth} className="rounded-full border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 h-10 w-10">
              <ChevronRight className="w-5 h-5 text-violet-600" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}