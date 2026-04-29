import React from "react";
import { Link, useLocation } from "react-router-dom";
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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-t border-violet-100 shadow-lg lg:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
          const active = pathname === to || (to === "/dashboard" && pathname === "/");
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[44px] ${
                active ? "text-violet-600" : "text-gray-400 hover:text-violet-500"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-violet-100" : ""}`}>
                {React.createElement(Icon, { className: "w-5 h-5" })}
              </div>
              <span className="text-[10px] font-semibold leading-none">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}