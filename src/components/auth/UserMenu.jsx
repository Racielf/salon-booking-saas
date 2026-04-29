import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Link } from 'react-router-dom';

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (!user) return null;

  const initials = (user.full_name || user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white/70 border-2 border-violet-100 hover:border-violet-300 transition-all shadow-sm"
      >
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-black text-xs shrink-0">
          {initials}
        </div>
        <span className="text-sm font-semibold text-gray-700 hidden sm:block max-w-[120px] truncate">
          {user.full_name || user.email}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-bold text-gray-800 truncate">{user.full_name || "User"}</p>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
            {user.role && (
              <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 capitalize">{user.role}</span>
            )}
          </div>

          <Link to="/settings" onClick={() => setOpen(false)}>
            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-violet-50 flex items-center gap-2 transition-colors">
              <Settings className="w-4 h-4 text-violet-400" /> Settings
            </button>
          </Link>

          <div className="border-t border-gray-100 mt-1">
            <button
              onClick={() => { setOpen(false); logout(); }}
              className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}