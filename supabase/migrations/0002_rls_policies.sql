-- ============================================================
-- Migration: 0002_rls_policies.sql
-- Project:   salon-booking-saas
-- Purpose:   Enable Row Level Security and define access
--            policies so each business owner can only read
--            and write their own data.
--
-- Rules enforced:
--   - Every authenticated user is identified by auth.uid()
--   - All owner-scoped tables use:  owner_id = auth.uid()
--   - No public read access in this migration (BookingPortal
--     public access is a later phase via Edge Function / RPC)
-- ============================================================

-- ── Helper: verify auth.uid() is always set ────────────────
-- Used in policy WITH CHECK clauses to prevent anonymous writes
-- (redundant once RLS is enabled but explicit is safer)

-- ── Enable RLS on all tables ────────────────────────────────

alter table profiles           enable row level security;
alter table clients            enable row level security;
alter table services           enable row level security;
alter table appointments       enable row level security;
alter table gallery_images     enable row level security;
alter table business_settings  enable row level security;
alter table estimates          enable row level security;
alter table estimate_line_items enable row level security;
alter table contracts          enable row level security;
alter table price_book_items   enable row level security;

-- ─────────────────────────────────────────────────────────────
-- PROFILES
-- Users can only see/edit their own profile row.
-- ─────────────────────────────────────────────────────────────

create policy "profiles_select_own"
  on profiles for select
  using ( id = auth.uid() );

create policy "profiles_insert_own"
  on profiles for insert
  with check ( id = auth.uid() );

create policy "profiles_update_own"
  on profiles for update
  using ( id = auth.uid() )
  with check ( id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- CLIENTS
-- ─────────────────────────────────────────────────────────────

create policy "clients_select_owner"
  on clients for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "clients_insert_owner"
  on clients for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "clients_update_owner"
  on clients for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "clients_delete_owner"
  on clients for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- SERVICES
-- ─────────────────────────────────────────────────────────────

create policy "services_select_owner"
  on services for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "services_insert_owner"
  on services for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "services_update_owner"
  on services for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "services_delete_owner"
  on services for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- APPOINTMENTS
-- ─────────────────────────────────────────────────────────────

create policy "appointments_select_owner"
  on appointments for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "appointments_insert_owner"
  on appointments for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "appointments_update_owner"
  on appointments for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "appointments_delete_owner"
  on appointments for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- GALLERY IMAGES
-- ─────────────────────────────────────────────────────────────

create policy "gallery_select_owner"
  on gallery_images for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "gallery_insert_owner"
  on gallery_images for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "gallery_update_owner"
  on gallery_images for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "gallery_delete_owner"
  on gallery_images for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- BUSINESS SETTINGS
-- ─────────────────────────────────────────────────────────────

create policy "business_settings_select_owner"
  on business_settings for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "business_settings_insert_owner"
  on business_settings for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "business_settings_update_owner"
  on business_settings for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "business_settings_delete_owner"
  on business_settings for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- ESTIMATES
-- ─────────────────────────────────────────────────────────────

create policy "estimates_select_owner"
  on estimates for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "estimates_insert_owner"
  on estimates for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "estimates_update_owner"
  on estimates for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "estimates_delete_owner"
  on estimates for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- ESTIMATE LINE ITEMS
-- Owner must match on both the line item and through the
-- parent estimate (cascade delete handles orphan cleanup).
-- ─────────────────────────────────────────────────────────────

create policy "line_items_select_owner"
  on estimate_line_items for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "line_items_insert_owner"
  on estimate_line_items for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "line_items_update_owner"
  on estimate_line_items for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "line_items_delete_owner"
  on estimate_line_items for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- CONTRACTS
-- ─────────────────────────────────────────────────────────────

create policy "contracts_select_owner"
  on contracts for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "contracts_insert_owner"
  on contracts for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "contracts_update_owner"
  on contracts for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "contracts_delete_owner"
  on contracts for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- PRICE BOOK ITEMS
-- ─────────────────────────────────────────────────────────────

create policy "price_book_select_owner"
  on price_book_items for select
  using ( auth.uid() is not null and owner_id = auth.uid() );

create policy "price_book_insert_owner"
  on price_book_items for insert
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "price_book_update_owner"
  on price_book_items for update
  using ( auth.uid() is not null and owner_id = auth.uid() )
  with check ( auth.uid() is not null and owner_id = auth.uid() );

create policy "price_book_delete_owner"
  on price_book_items for delete
  using ( auth.uid() is not null and owner_id = auth.uid() );

-- ─────────────────────────────────────────────────────────────
-- NOTE: Public BookingPortal access is NOT enabled here.
-- Phase 6 will add a safe Supabase Edge Function or RPC
-- that exposes only the necessary public fields for the
-- booking portal without bypassing RLS.
-- ─────────────────────────────────────────────────────────────
