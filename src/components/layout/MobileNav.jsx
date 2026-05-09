import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, Scissors, Images, Settings } from "lucide-react";

const NAV_ITEMS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/clients", icon: Users, label: "Clients" },
  { to: "/services", icon: Scissors, label: "Services" },
  { to: "/gallery", icon: Images, label: "Gallery" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function MobileNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-salon-soft safe-area-bottom lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to !== "/" && pathname.startsWith(to));
          return (
            <Link key={to} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl">
              <motion.div
                className={`flex flex-col items-center gap-0.5 ${active ? "text-[#6366F1]" : "text-gray-400"}`}
                animate={active ? { y: -2, scale: 1.08 } : { y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="w-1 h-1 rounded-full bg-[#6366F1]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
