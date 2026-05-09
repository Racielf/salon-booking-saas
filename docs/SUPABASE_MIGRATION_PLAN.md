# Supabase Migration Plan — salon-booking-saas

## Overview

This document describes the strategy for migrating salon-booking-saas from Base44 to Supabase as its persistent database and auth backend.

---

## Why Supabase?

The current app uses the Base44 SDK (`@base44/sdk`) for data persistence and authentication. Base44 requires:
- `VITE_BASE44_APP_ID` — injected by the Base44 hosting platform at runtime
- `VITE_BASE44_BACKEND_URL` — the Base44 API endpoint
- An access token set via URL params on first load

When the app runs outside Base44's own hosting (Vercel Preview, GitHub Pages), these params are absent, so **every create/filter/update call fails silently** — the URL becomes `/apps/null/entities/Client` which returns 404.

Supabase eliminates this dependency: it is a standard PostgreSQL database with a REST/realtime API, authentication, and Row Level Security that works identically on every hosting platform.

---

## Current Limitation (Confirmed)

| Check | Result |
|---|---|
| `appId` in bundle | ❌ `null` — `defaultValue:null` confirmed in bundle scan |
| `serverUrl` in bundle | ❌ `null` — same |
| Client create on Vercel Preview | ❌ `POST /apps/null/entities/Client → 404` |
| Estimate create on Vercel Preview | ❌ same |
| Contract create on Vercel Preview | ❌ same |

---

## Migration Phases

### Phase 1 — Supabase Foundation ✅ (this PR)
- Create Supabase schema (`supabase/migrations/0001_initial_schema.sql`)
- Enable RLS (`supabase/migrations/0002_rls_policies.sql`)
- Add Supabase JS client (`src/api/supabaseClient.js`)
- Add data adapter skeleton (`src/api/dataAdapter.js`)
- Add `.env.example`
- Add this document
- **No UI changes. Base44 untouched. All pages unchanged.**

### Phase 2 — Auth + Clients
- Replace `AuthContext.jsx` to use Supabase Auth (`supabase.auth.signInWithOAuth` / email OTP)
- Migrate `Clients.jsx` to use `db.entities.Client` from `dataAdapter.js`
- Confirm RLS: each owner sees only their clients
- QA: create, edit, delete client

### Phase 3 — Services + Settings
- Migrate `Services.jsx` to `db.entities.Service`
- Migrate `Settings.jsx` to `db.entities.BusinessSettings`
- Migrate `PriceBookSection.jsx` to `db.entities.PriceBookItem`
- QA: starter price book loads, settings save

### Phase 4 — Appointments / Calendar
- Migrate appointment queries (Dashboard, Calendar) to `db.entities.Appointment`
- Loyalty behavior categorization continues to work from real appointment data
- QA: appointment create, status change, dashboard metrics

### Phase 5 — Estimates + Contracts + Price Book
- Migrate `Estimates.jsx` to Supabase
- Handle `estimate_line_items` as a separate table (Base44 stored as JSONB array)
- Migrate `Contracts.jsx`
- QA: estimate create with line items, contract status → signed_at auto-set

### Phase 6 — Public BookingPortal
- Implement a Supabase Edge Function or safe RPC (`get_public_business_profile`)
- This exposes only: business name, services, available slots — no other owner data
- RLS remains intact; BookingPortal uses Edge Function, not direct table access
- QA: booking flow end-to-end without authentication

---

## RLS Strategy

All tables use `owner_id = auth.uid()` policies for every operation:

```sql
create policy "clients_select_owner"
  on clients for select
  using ( auth.uid() is not null and owner_id = auth.uid() );
```

- Every row written includes `owner_id = auth.uid()` from the frontend
- Even if the anon key is exposed, no user can read another owner's data
- The service_role key is never in frontend code

---

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Vercel + local `.env.local` | Your project's Supabase URL |
| `VITE_SUPABASE_ANON_KEY` | Vercel + local `.env.local` | Public anon key — safe for frontend |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions only | ⚠️ Never in frontend |

### Setting in Vercel
1. Go to Vercel → Project → Settings → Environment Variables
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Enable for: Production, Preview, Development

### Setting locally
```bash
cp .env.example .env.local
# fill in your values
```

---

## QA Checklist (per phase)

- [ ] `npm run build` passes
- [ ] `npm run lint` — no new errors
- [ ] `npm run typecheck` — no new errors
- [ ] Manual: create a record, reload page, record persists
- [ ] Manual: log in as a different user, verify previous user's data is not visible
- [ ] Manual: BookingPortal accessible without auth (Phase 6 only)

---

## Running Migrations

> ⚠️ **WARNING: Never run `supabase db push` on the production database without explicit team approval.**

### Staging / local
```bash
# Link to your Supabase project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations to staging
supabase db push --db-url YOUR_STAGING_DB_URL

# Or run locally with Supabase CLI
supabase start
supabase db reset   # applies all migrations from scratch
```

### Production
- Requires written approval in this PR before running
- Always backup first
- Run one migration at a time and verify

---

## File Map

```
supabase/
  migrations/
    0001_initial_schema.sql   ← tables, indexes, triggers
    0002_rls_policies.sql     ← RLS + policies

src/api/
  supabaseClient.js           ← Supabase JS client (safe)
  dataAdapter.js              ← Base44-compatible adapter
  base44Client.js             ← unchanged (do not remove until Phase 5)

.env.example                  ← env var template
docs/SUPABASE_MIGRATION_PLAN.md ← this file
```

---

*Document created: 2026-05-09*
*Author: Antigravity*
*Status: Phase 1 complete — awaiting review before Phase 2*
