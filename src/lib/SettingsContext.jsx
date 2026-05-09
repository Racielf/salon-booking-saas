/**
 * SettingsContext.jsx — Phase 3: Supabase BusinessSettings
 *
 * Replaces base44.entities.BusinessSettings with db.entities.BusinessSettings
 * from the Supabase data adapter.
 *
 * The context shape is identical:
 *   { settings, saveSettings, loading }
 * All settings UI components (BusinessProfileSection, etc.) are unchanged.
 *
 * Supabase table: business_settings
 *   - One row per owner (unique constraint on owner_id)
 *   - Settings stored in the `settings` JSONB column
 *   - RLS: owner_id = auth.uid()
 */

import React, { createContext, useContext, useState, useEffect } from "react";
import { db, auth as sbAuth } from "@/api/dataAdapter";  // Phase 3: Supabase

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
  hours_monday:    { open: true,  start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_tuesday:   { open: true,  start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_wednesday: { open: true,  start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_thursday:  { open: true,  start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_friday:    { open: true,  start: "09:00", end: "18:00", break_start: "", break_end: "" },
  hours_saturday:  { open: true,  start: "10:00", end: "16:00", break_start: "", break_end: "" },
  hours_sunday:    { open: false, start: "10:00", end: "15:00", break_start: "", break_end: "" },
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
  const [recordId, setRecordId]   = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        const user = await sbAuth.me();
        if (!user) { setLoading(false); return; }

        // business_settings table stores settings in a JSONB `settings` column.
        // One row per owner (unique constraint), so we take the first result.
        const records = await db.entities.BusinessSettings.filter({ owner_id: user.id });

        if (records && records.length > 0) {
          setRecordId(records[0].id);
          // Merge the stored `settings` JSONB blob with DEFAULTS
          const storedSettings = records[0].settings || {};
          setSettings({ ...DEFAULTS, ...storedSettings });
        }
      } catch (err) {
        console.warn('[SettingsContext] Failed to load settings:', err.message);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  /**
   * saveSettings — persists a partial or full settings update.
   * Merges with existing settings before saving.
   */
  const saveSettings = async (newSettings) => {
    const user = await sbAuth.me();
    if (!user) throw new Error('Not authenticated');

    const merged = { ...settings, ...newSettings };

    if (recordId) {
      // Update existing row — store all settings in the `settings` JSONB column
      await db.entities.BusinessSettings.update(recordId, {
        settings: merged,
        owner_id: user.id,
      });
    } else {
      // First save — create a new row for this owner
      const created = await db.entities.BusinessSettings.create({
        owner_id: user.id,
        settings: merged,
      });
      setRecordId(created.id);
    }

    setSettings(merged);
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