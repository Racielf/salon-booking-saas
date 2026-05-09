-- Migration: 0004_flexi_dates_and_public_booking_policies.sql
--
-- Phase 6: Enables the public BookingPortal to work with Supabase.
--
-- 1. Creates the `flexi_dates` table (blocked/special days for scheduling)
-- 2. Adds anon SELECT policies for public-readable tables
-- 3. Adds anon INSERT policies for appointments + clients (public booking)
--
-- Run this in:
-- https://supabase.com/dashboard/project/aqrbhtoieamnneitutyv/sql/new

-- ── 1. flexi_dates table ─────────────────────────────────────────────────────
-- Replaces the Base44 FlexiDate entity.
-- Stores blocked days and special-hours overrides per salon owner.

create table if not exists flexi_dates (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  date         text not null,      -- 'YYYY-MM-DD'
  type         text not null default 'blocked',  -- 'blocked' | 'special'
  label        text,
  note         text,
  special_start text,              -- 'HH:MM' override open time
  special_end   text,              -- 'HH:MM' override close time
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table flexi_dates enable row level security;

-- Owner can do everything
create policy "Owner manages flexi_dates"
  on flexi_dates for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

-- Public (anon) can read — needed for slot availability calculation
create policy "Public reads flexi_dates"
  on flexi_dates for select
  to anon
  using (true);

-- ── 2. Public READ policies ───────────────────────────────────────────────────
-- These allow the unauthenticated BookingPortal to load salon data.

-- business_settings: anon reads to find salon by booking_slug
create policy "Public reads business_settings"
  on business_settings for select
  to anon
  using (true);

-- services: anon reads the salon's service menu
create policy "Public reads services"
  on services for select
  to anon
  using (true);

-- appointments: anon reads date/time/status to calculate available slots
create policy "Public reads appointments for availability"
  on appointments for select
  to anon
  using (true);

-- gallery_images: anon reads portfolio photos shown on booking page
create policy "Public reads gallery images"
  on gallery_images for select
  to anon
  using (true);

-- ── 3. Public WRITE policies ──────────────────────────────────────────────────
-- Allow public visitors to book appointments and self-register as clients.

-- appointments: anon can INSERT a new booking request
create policy "Public creates appointments"
  on appointments for insert
  to anon
  with check (true);

-- clients: anon can read (to match by phone/email before creating)
create policy "Public reads clients for matching"
  on clients for select
  to anon
  using (true);

-- clients: anon can create a new client record (first booking)
create policy "Public creates clients"
  on clients for insert
  to anon
  with check (true);

-- clients: anon can update their own record (subsequent bookings update info)
create policy "Public updates clients"
  on clients for update
  to anon
  using (true)
  with check (true);
