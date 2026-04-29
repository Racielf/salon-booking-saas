import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const SettingsContext = createContext(null);

const DEFAULTS = {
  business_name: "YMY Pro Salon",
  owner_name: "",
  phone: "",
  email: "",
  address: "",
  website: "",
  logo_url: "",
  description: "",
  hours_monday: { open: true, start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_tuesday: { open: true, start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_wednesday: { open: true, start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_thursday: { open: true, start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_friday: { open: true, start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_saturday: { open: true, start: "10:00", end: "16:00", break_start: "", break_end: "" },
  hours_sunday: { open: false, start: "10:00", end: "15:00", break_start: "", break_end: "" },
  default_duration: 60,
  slot_interval: 30,
  buffer_time: 0,
  allow_same_day: true,
  require_approval: false,
  whatsapp_template: "Hi {{client_name}}, this is a reminder for your appointment on {{date}} at {{time}} at {{business_name}}. See you soon! 💇",
  email_template: "Dear {{client_name}},\n\nThis is a reminder for your upcoming appointment on {{date}} at {{time}}.\n\nService: {{services}}\nLocation: {{address}}\n\nBest regards,\n{{business_name}}",
  reminders_enabled: false,
  reminder_time: "24",
  currency: "USD",
  deposit_required: false,
  deposit_type: "percentage",
  deposit_value: 20,
  payment_methods: ["cash", "card"],
  cancellation_fee: "",
  primary_color: "#7c3aed",
  secondary_color: "#ec4899",
  accent_color: "#f97316",
  display_name: "YMY Pro",
  slogan: "",
  booking_slug: "",
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULTS);
  const [recordId, setRecordId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      const user = await base44.auth.me();
      if (!user) { setLoading(false); return; }
      // Filter by owner_id to ensure strict business isolation
      const records = await base44.entities.BusinessSettings.filter({ owner_id: user.id });
      if (records && records.length > 0) {
        setRecordId(records[0].id);
        setSettings({ ...DEFAULTS, ...records[0] });
      }
      setLoading(false);
    }
    loadSettings().catch(() => setLoading(false));
  }, []);

  const saveSettings = async (newSettings) => {
    const user = await base44.auth.me();
    const payload = { ...newSettings, owner_id: user?.id };
    if (recordId) {
      await base44.entities.BusinessSettings.update(recordId, payload);
    } else {
      const created = await base44.entities.BusinessSettings.create(payload);
      setRecordId(created.id);
    }
    setSettings({ ...DEFAULTS, ...newSettings });
  };

  return (
    <SettingsContext.Provider value={{ settings, saveSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}