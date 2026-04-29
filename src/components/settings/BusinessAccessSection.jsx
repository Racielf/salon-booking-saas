import React from "react";
import { Shield, Lock, Users, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

export default function BusinessAccessSection({ data, onChange }) {
  const { user, logout } = useAuth();

  return (
    <div className="space-y-6">
      {/* Auth system notice */}
      <div className="flex items-start gap-3 p-4 bg-violet-50 border border-violet-100 rounded-2xl">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shrink-0 mt-0.5">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-violet-800 mb-1">Secured by Base44 Authentication</p>
          <p className="text-xs text-violet-600 leading-relaxed">
            Login, registration, email verification, and password reset are all managed securely by the Base44 platform. 
            No credentials are stored within this application.
          </p>
        </div>
      </div>

      {/* Current logged-in user */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-500" /> Current Session
        </h3>
        <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {(user?.full_name || user?.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{user?.full_name || "—"}</p>
              <p className="text-xs text-gray-400">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-violet-100 text-violet-700 text-[10px] font-bold rounded-full uppercase tracking-wide">
                {user?.role || "user"}
              </span>
            </div>
          </div>
          <button
            onClick={() => logout(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 border border-red-100 hover:border-red-300 px-3 py-2 rounded-xl transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Business owner details */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-violet-500" /> Business Owner Details
        </h3>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Owner Name</label>
            <input
              type="text"
              value={data?.owner_name || ""}
              onChange={(e) => onChange("owner_name", e.target.value)}
              placeholder="Your full name"
              className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Business Email</label>
            <input
              type="email"
              value={data?.email || ""}
              onChange={(e) => onChange("email", e.target.value)}
              placeholder="salon@example.com"
              className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Business Phone</label>
            <input
              type="tel"
              value={data?.phone || ""}
              onChange={(e) => onChange("phone", e.target.value)}
              placeholder="+1 555 000 0000"
              className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-300 transition"
            />
          </div>
        </div>
      </div>

      {/* Authorized users note */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
        <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
          <Users className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-amber-800 mb-1">User Access Management</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            User access is managed through the Base44 authentication system. 
            To invite or remove team members, use the Base44 dashboard. 
            Only authorized users can access this salon management system.
          </p>
          <a
            href="https://base44.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-2 text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors"
          >
            Manage via Base44 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}