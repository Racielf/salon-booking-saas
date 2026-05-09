import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Building2, Clock, Calendar, Bell, CreditCard, Palette, Check, Settings as SettingsIcon, Shield, Link2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/lib/SettingsContext";
import MobileNav from "@/components/layout/MobileNav";

import BusinessProfileSection from "@/components/settings/BusinessProfileSection";
import BusinessHoursSection from "@/components/settings/BusinessHoursSection";
import AppointmentSettingsSection from "@/components/settings/AppointmentSettingsSection";
import NotificationSettingsSection from "@/components/settings/NotificationSettingsSection";
import PaymentSettingsSection from "@/components/settings/PaymentSettingsSection";
import BrandingSettingsSection from "@/components/settings/BrandingSettingsSection";
import BusinessAccessSection from "@/components/settings/BusinessAccessSection";
import BookingLinkSection from "@/components/settings/BookingLinkSection";
import PriceBookSection from "@/components/settings/PriceBookSection";

const SECTIONS = [
  { id: "profile", label: "Business Profile", icon: Building2 },
  { id: "hours", label: "Business Hours", icon: Clock },
  { id: "appointments", label: "Appointments", icon: Calendar },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "booking_link", label: "Booking Link", icon: Link2 },
  { id: "access", label: "Business Access", icon: Shield },
  { id: "price_book", label: "Price Book", icon: BookOpen },
];

function SectionCard({ id, label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2.5 w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
        active
          ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200"
          : "text-gray-600 hover:bg-white/70"
      }`}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

export default function Settings() {
  const { settings, saveSettings, loading: settingsLoading } = useSettings();
  const [activeSection, setActiveSection] = useState("profile");
  const [formData, setFormData] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [ownerId, setOwnerId] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    await saveSettings(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const currentSection = SECTIONS.find((s) => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl pb-24 lg:pb-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="p-2 rounded-full hover:bg-white/60 transition-colors">
                <ChevronLeft className="w-5 h-5 text-violet-600" />
              </button>
            </Link>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-5 py-2.5 rounded-2xl">
                <h1 className="text-xl font-black flex items-center gap-2">
                  <SettingsIcon className="w-5 h-5" /> Settings
                </h1>
              </div>
            </div>
          </div>

          {activeSection !== "access" && activeSection !== "price_book" && <Button
            onClick={handleSave}
            disabled={saving || settingsLoading}
            className={`rounded-full px-6 font-bold shadow-lg gap-2 transition-all ${
              saved
                ? "bg-green-500 hover:bg-green-600 shadow-green-200"
                : "bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 shadow-fuchsia-200"
            } text-white`}
          >
            {saving ? (
              <span className="flex items-center gap-2"><span className="animate-spin text-sm">⏳</span> Saving...</span>
            ) : saved ? (
              <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Saved!</span>
            ) : (
              "Save Settings"
            )}
          </Button>}
        </motion.div>

        {/* Mobile: horizontal scrollable tabs */}
        <div className="lg:hidden mb-4 -mx-1">
          <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-1.5 shrink-0 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                    active
                      ? "bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-200"
                      : "bg-white/70 text-gray-500 border border-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Desktop sidebar nav */}
          <motion.aside
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block bg-white/70 backdrop-blur rounded-2xl p-3 shadow-sm border border-white h-fit space-y-1 lg:sticky lg:top-6"
          >
            {SECTIONS.map((s) => (
              <SectionCard
                key={s.id}
                id={s.id}
                label={s.label}
                icon={s.icon}
                active={activeSection === s.id}
                onClick={setActiveSection}
              />
            ))}
          </motion.aside>

          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-3"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="bg-white/70 backdrop-blur rounded-2xl p-6 shadow-sm border border-white"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-100">
                  {currentSection && (
                    <>
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                        <currentSection.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-gray-800">{currentSection.label}</h2>
                        <p className="text-xs text-gray-400">Configure your {currentSection.label.toLowerCase()} settings</p>
                      </div>
                    </>
                  )}
                </div>

                {activeSection === "profile" && (
                  <BusinessProfileSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "hours" && (
                  <BusinessHoursSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "appointments" && (
                  <AppointmentSettingsSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "notifications" && (
                  <NotificationSettingsSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "payment" && (
                  <PaymentSettingsSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "branding" && (
                  <BrandingSettingsSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "booking_link" && (
                  <BookingLinkSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "access" && (
                  <BusinessAccessSection data={formData} onChange={handleChange} />
                )}
                {activeSection === "price_book" && (
                  <PriceBookSection ownerId={ownerId} />
                )}

                {/* Bottom save — hidden on access and price_book tabs (they manage own CRUD) */}
                {activeSection !== "access" && activeSection !== "price_book" && (
                  <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className={`rounded-xl px-8 font-bold gap-2 ${
                        saved
                          ? "bg-green-500 hover:bg-green-600"
                          : "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700"
                      } text-white shadow-lg`}
                    >
                      {saving ? "Saving..." : saved ? <><Check className="w-4 h-4" /> Saved!</> : "Save Settings"}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}