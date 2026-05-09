/**
 * dataAdapter.js
 *
 * Supabase data adapter for salon-booking-saas.
 *
 * PURPOSE:
 *   Provides a Base44-compatible interface (filter, create, update, delete)
 *   backed by Supabase, to enable gradual page-by-page migration without
 *   a big-bang rewrite.
 *
 * CURRENT STATE (Phase 6 — BookingPortal):
 *   - All dashboard entities migrated to Supabase (Phases 2-5).
 *   - FlexiDate added for flexi_dates table.
 *   - supabase client exported directly for JSONB queries.
 *
 * MIGRATION PATTERN (when a page is ready to migrate):
 *   BEFORE: import { base44 } from "@/api/base44Client";
 *           const data = await base44.entities.Client.filter({ owner_id });
 *
 *   AFTER:  import { db } from "@/api/dataAdapter";
 *           const data = await db.entities.Client.filter({ owner_id });
 *
 * Do NOT change existing imports until the page is approved for migration.
 */

import { supabase } from "@/api/supabaseClient";

// ── Generic CRUD helpers ─────────────────────────────────────────────────────
// These wrap the Supabase JS client with consistent error handling.
// Table names must match the SQL schema exactly (snake_case).

/**
 * List all rows from a table.
 * Applies owner_id filter automatically when provided.
 * @param {string} table
 * @param {Object} [opts]
 * @param {string} [opts.orderBy]   column name
 * @param {boolean} [opts.ascending]
 * @returns {Promise<any[]>}
 */
async function list(table, { orderBy = "created_at", ascending = false } = {}) {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order(orderBy, { ascending });
  if (error) throw new Error(`[dataAdapter] list(${table}): ${error.message}`);
  return data ?? [];
}

/**
 * Filter rows by an arbitrary filters object.
 * All filter entries are combined with AND (eq).
 * @param {string} table
 * @param {Object} filters  e.g. { owner_id: "uuid", status: "draft" }
 * @param {Object} [opts]
 * @returns {Promise<any[]>}
 */
async function filter(table, filters = {}, { orderBy = "created_at", ascending = false } = {}) {
  let query = supabase.from(table).select("*");

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      query = query.eq(key, value);
    }
  }

  query = query.order(orderBy, { ascending });

  const { data, error } = await query;
  if (error) throw new Error(`[dataAdapter] filter(${table}): ${error.message}`);
  return data ?? [];
}

/**
 * Create a single row.
 * @param {string} table
 * @param {Object} payload
 * @returns {Promise<Object>}  the created row
 */
async function create(table, payload) {
  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(`[dataAdapter] create(${table}): ${error.message}`);
  return data;
}

/**
 * Update a row by id.
 * @param {string} table
 * @param {string} id   UUID
 * @param {Object} payload
 * @returns {Promise<Object>}  the updated row
 */
async function update(table, id, payload) {
  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(`[dataAdapter] update(${table}): ${error.message}`);
  return data;
}

/**
 * Delete a row by id.
 * @param {string} table
 * @param {string} id   UUID
 * @returns {Promise<void>}
 */
async function remove(table, id) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq("id", id);
  if (error) throw new Error(`[dataAdapter] delete(${table}): ${error.message}`);
}

// ── Entity adapter factory ───────────────────────────────────────────────────
// Builds a Base44-compatible interface for a given Supabase table name.
// Usage once a page is migrated:
//   await db.entities.Client.filter({ owner_id })
//   await db.entities.Client.create({ owner_id, name, phone })
//   await db.entities.Client.update(id, { name })
//   await db.entities.Client.delete(id)

function makeEntityAdapter(tableName) {
  return {
    list:   (opts)                => list(tableName, opts),
    filter: (filters, opts)       => filter(tableName, filters, opts),
    create: (payload)             => create(tableName, payload),
    update: (id, payload)         => update(tableName, id, payload),
    delete: (id)                  => remove(tableName, id),
  };
}

// ── Public db object ─────────────────────────────────────────────────────────
// Mirrors the shape of base44.entities.* for easy migration.
//
// Table name mapping (Base44 entity → Supabase table):
//   Client        → clients
//   Service       → services
//   Appointment   → appointments
//   GalleryImage  → gallery_images
//   Estimate      → estimates
//   Contract      → contracts
//   PriceBookItem → price_book_items
//
// EstimateLineItems is managed internally via Estimate create/update
// (Base44 stored line_items as a JSONB array; Supabase uses a separate
// table — migration adapter for this is Phase 5).

export const db = {
  entities: {
    Client:        makeEntityAdapter("clients"),
    Service:       makeEntityAdapter("services"),
    Appointment:   makeEntityAdapter("appointments"),
    GalleryImage:  makeEntityAdapter("gallery_images"),
    BusinessSettings: makeEntityAdapter("business_settings"),
    Estimate:      makeEntityAdapter("estimates"),
    Contract:      makeEntityAdapter("contracts"),
    PriceBookItem: makeEntityAdapter("price_book_items"),
    FlexiDate:     makeEntityAdapter("flexi_dates"),  // Phase 6: blocked/special days
  },

  // Direct Supabase client access for advanced queries
  // (RPC calls, joins, etc.)
  raw: supabase,
};

// ── Auth helpers ─────────────────────────────────────────────────────────────
// Minimal auth surface — mirrors base44.auth.me() shape.
// Returns { id, email } or null.

export const auth = {
  async me() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return { id: user.id, email: user.email };
  },

  async signOut() {
    await supabase.auth.signOut();
  },
};
