-- Migration: 0003_estimates_line_items_column.sql
-- Adds a line_items JSONB column to the estimates table for Phase 5 migration.
-- Base44 stored line items as a JSONB array on the estimate record.
-- In Supabase we maintain backward compatibility by keeping this column.
-- (A future Phase 6 migration can normalize to the estimate_line_items table.)

alter table estimates
  add column if not exists line_items jsonb not null default '[]'::jsonb;

-- Allow the column to store null (optional line items)
comment on column estimates.line_items is
  'Array of {description, quantity, unit_price, total} objects. Phase 5 compat column.';
