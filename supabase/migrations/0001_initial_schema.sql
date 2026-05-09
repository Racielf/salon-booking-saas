-- ============================================================
-- Migration: 0001_initial_schema.sql
-- Project:   salon-booking-saas
-- Purpose:   Create all tables for Supabase backend foundation.
-- Run via:   supabase db push  (staging only — never run on
--            production without explicit team approval)
-- ============================================================

-- Enable pgcrypto for gen_random_uuid() on older Postgres versions
create extension if not exists pgcrypto;

-- ── Updated-at trigger ──────────────────────────────────────
-- Attach to any table to keep updated_at current automatically
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ── 1. profiles ─────────────────────────────────────────────
-- One row per authenticated user; mirrors auth.users.
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  owner_name    text,
  phone         text,
  email         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ── 2. clients ──────────────────────────────────────────────
create table if not exists clients (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  phone      text,
  email      text,
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_clients_owner_id on clients(owner_id);

create trigger trg_clients_updated_at
  before update on clients
  for each row execute function set_updated_at();

-- ── 3. services ─────────────────────────────────────────────
create table if not exists services (
  id               uuid primary key default gen_random_uuid(),
  owner_id         uuid not null references auth.users(id) on delete cascade,
  name             text not null,
  description      text,
  duration_minutes integer not null default 60,
  price            numeric(10,2) not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_services_owner_id on services(owner_id);

create trigger trg_services_updated_at
  before update on services
  for each row execute function set_updated_at();

-- ── 4. appointments ─────────────────────────────────────────
-- status values used by the frontend: pending | confirmed |
-- completed | cancelled | no_show
create table if not exists appointments (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  client_id     uuid references clients(id) on delete set null,
  date          date not null,
  start_time    time,
  end_time      time,
  status        text not null default 'pending'
                  check (status in ('pending','confirmed','completed','cancelled','no_show')),
  service_names text[],
  total_price   numeric(10,2) default 0,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_appointments_owner_date on appointments(owner_id, date);

create trigger trg_appointments_updated_at
  before update on appointments
  for each row execute function set_updated_at();

-- ── 5. gallery_images ───────────────────────────────────────
create table if not exists gallery_images (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null references auth.users(id) on delete cascade,
  title      text,
  image_url  text not null,
  category   text,
  is_visible boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_gallery_images_owner_id on gallery_images(owner_id);

create trigger trg_gallery_images_updated_at
  before update on gallery_images
  for each row execute function set_updated_at();

-- ── 6. business_settings ────────────────────────────────────
-- One row per owner (unique constraint); settings stored as JSONB.
create table if not exists business_settings (
  id         uuid primary key default gen_random_uuid(),
  owner_id   uuid not null unique references auth.users(id) on delete cascade,
  settings   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_business_settings_owner_id on business_settings(owner_id);

create trigger trg_business_settings_updated_at
  before update on business_settings
  for each row execute function set_updated_at();

-- ── 7. estimates ────────────────────────────────────────────
-- status values: draft | sent | approved | rejected | converted
create table if not exists estimates (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  client_id   uuid references clients(id) on delete set null,
  client_name text,
  title       text not null,
  status      text not null default 'draft'
                check (status in ('draft','sent','approved','rejected','converted')),
  subtotal    numeric(10,2) default 0,
  discount    numeric(10,2) default 0,
  tax         numeric(10,2) default 0,
  total       numeric(10,2) default 0,
  valid_until date,
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_estimates_owner_id on estimates(owner_id);

create trigger trg_estimates_updated_at
  before update on estimates
  for each row execute function set_updated_at();

-- ── 8. estimate_line_items ──────────────────────────────────
create table if not exists estimate_line_items (
  id          uuid primary key default gen_random_uuid(),
  estimate_id uuid not null references estimates(id) on delete cascade,
  owner_id    uuid not null references auth.users(id) on delete cascade,
  description text not null,
  quantity    numeric(10,2) not null default 1,
  unit_price  numeric(10,2) not null default 0,
  total       numeric(10,2) not null default 0,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists idx_line_items_owner_estimate
  on estimate_line_items(owner_id, estimate_id);

-- ── 9. contracts ────────────────────────────────────────────
-- status values: draft | sent | signed | cancelled
create table if not exists contracts (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references auth.users(id) on delete cascade,
  client_id     uuid references clients(id) on delete set null,
  client_name   text,
  estimate_id   uuid references estimates(id) on delete set null,
  title         text not null,
  status        text not null default 'draft'
                  check (status in ('draft','sent','signed','cancelled')),
  contract_text text,
  terms         text,
  start_date    date,
  end_date      date,
  signed_at     timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_contracts_owner_id on contracts(owner_id);

create trigger trg_contracts_updated_at
  before update on contracts
  for each row execute function set_updated_at();

-- ── 10. price_book_items ────────────────────────────────────
-- price_type values: fixed | range
create table if not exists price_book_items (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references auth.users(id) on delete cascade,
  category    text,
  name        text not null,
  description text,
  price_type  text not null default 'fixed'
                check (price_type in ('fixed','range')),
  price       numeric(10,2),
  min_price   numeric(10,2),
  max_price   numeric(10,2),
  is_active   boolean not null default true,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_price_book_owner_category
  on price_book_items(owner_id, category);

create trigger trg_price_book_items_updated_at
  before update on price_book_items
  for each row execute function set_updated_at();
