/**
 * supabaseClient.js
 *
 * Supabase client for salon-booking-saas.
 *
 * SECURITY RULES:
 *  - Only VITE_SUPABASE_ANON_KEY is used here (safe for frontend).
 *  - The service_role key must NEVER appear in this file or any
 *    frontend code. It belongs only in server-side Edge Functions.
 *  - Configure both env vars in Vercel and GitHub Actions secrets.
 *  - Local development: copy .env.example to .env.local and fill in.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (import.meta.env.DEV) {
  if (!supabaseUrl) {
    console.warn(
      "[supabaseClient] VITE_SUPABASE_URL is not set. " +
      "Copy .env.example to .env.local and fill in your Supabase project URL."
    );
  }
  if (!supabaseKey) {
    console.warn(
      "[supabaseClient] VITE_SUPABASE_ANON_KEY is not set. " +
      "Copy .env.example to .env.local and fill in your Supabase anon key."
    );
  }
}

/**
 * Supabase client instance.
 *
 * Import this wherever you need to query Supabase:
 *   import { supabase } from "@/api/supabaseClient";
 *
 * Do NOT import or use this in BookingPortal until Phase 6
 * (public booking with safe RPC/Edge Function) is approved.
 */
export const supabase = createClient(supabaseUrl ?? "", supabaseKey ?? "");
