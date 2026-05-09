import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Plus, Search, Trash2, Pencil, ChevronLeft,
  X, Check, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import MobileNav from "@/components/layout/MobileNav";

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-500"     },
  sent:      { label: "Sent",      cls: "bg-blue-100 text-blue-600"     },
  approved:  { label: "Approved",  cls: "bg-green-100 text-green-600"   },
  rejected:  { label: "Rejected",  cls: "bg-red-100 text-red-500"       },
  converted: { label: "Converted", cls: "bg-violet-100 text-violet-600" },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Line item math ────────────────────────────────────────────────────────────
function calcTotals(lineItems, discount = 0, tax = 0) {
  const subtotal = lineItems.reduce((s, li) => s + (parseFloat(li.quantity) || 0) * (parseFloat(li.unit_price) || 0), 0);
  const total = Math.max(0, subtotal - (parseFloat(discount) || 0)) + (parseFloat(tax) || 0);
  return { subtotal, total };
}

// ── Inline form ───────────────────────────────────────────────────────────────
function EstimateForm({ estimate, clients, ownerId, onCancel, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle]         = useState(estimate?.title || "");
  const [clientId, setClientId]   = useState(estimate?.client_id || "");
  const [clientName, setClientName] = useState(estimate?.client_name || "");
  const [status, setStatus]       = useState(estimate?.status || "draft");
  const [validUntil, setValidUntil] = useState(estimate?.valid_until || "");
  const [notes, setNotes]         = useState(estimate?.notes || "");
  const [discount, setDiscount]   = useState(estimate?.discount ?? 0);
  const [tax, setTax]             = useState(estimate?.tax ?? 0);
  const [lineItems, setLineItems] = useState(
    estimate?.line_items?.length ? estimate.line_items : [{ description: "", quantity: 1, unit_price: 0, total: 0 }]
  );
  const [saving, setSaving] = useState(false);

  const { subtotal, total } = calcTotals(lineItems, discount, tax);

  const updateLine = (i, field, val) => {
    setLineItems(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: val };
      next[i].total = (parseFloat(next[i].quantity) || 0) * (parseFloat(next[i].unit_price) || 0);
      return next;
    });
  };
  const addLine    = () => setLineItems(p => [...p, { description: "", quantity: 1, unit_price: 0, total: 0 }]);
  const removeLine = (i) => setLineItems(p => p.filter((_, idx) => idx !== i));

  const handleClientChange = (id) => {
    setClientId(id);
    const c = clients.find(c => c.id === id);
    setClientName(c?.name || "");
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      owner_id: ownerId, title: title.trim(),
      client_id: clientId || null, client_name: clientName || null,
      status, line_items: lineItems, subtotal, discount: parseFloat(discount) || 0,
      tax: parseFloat(tax) || 0, total,
      valid_until: validUntil || null, notes: notes.trim() || null,
      updated_date: today,
      ...(estimate ? {} : { created_date: today }),
    };
    try {
      if (estimate?.id) {
        await base44.entities.Estimate.update(estimate.id, payload);
      } else {
        await base44.entities.Estimate.create(payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-md border border-violet-100">
      <h2 className="font-black text-gray-800 mb-4">{estimate ? "Edit Estimate" : "New Estimate"}</h2>

      {/* Title + Client */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Hair + Color Package" className="rounded-xl border-violet-200" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Client</label>
          <select value={clientId} onChange={e => handleClientChange(e.target.value)}
            className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
            <option value="">— No client —</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* Status + Valid Until */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
            {Object.keys(STATUS_STYLES).map(k => <option key={k} value={k}>{STATUS_STYLES[k].label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Valid Until</label>
          <Input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="rounded-xl border-violet-200" />
        </div>
      </div>

      {/* Line items */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-500">Line Items</label>
          <button onClick={addLine} className="text-xs text-violet-600 font-bold hover:underline flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add row
          </button>
        </div>
        <div className="space-y-2">
          {lineItems.map((li, i) => (
            <div key={i} className="grid grid-cols-[1fr_60px_80px_70px_24px] gap-2 items-center">
              <Input value={li.description} onChange={e => updateLine(i, "description", e.target.value)}
                placeholder="Description" className="rounded-lg border-violet-100 text-sm h-8" />
              <Input type="number" value={li.quantity} onChange={e => updateLine(i, "quantity", e.target.value)}
                placeholder="Qty" className="rounded-lg border-violet-100 text-sm h-8 text-center" min={0} />
              <Input type="number" value={li.unit_price} onChange={e => updateLine(i, "unit_price", e.target.value)}
                placeholder="Price" className="rounded-lg border-violet-100 text-sm h-8" min={0} />
              <span className="text-xs text-right font-mono text-gray-600 pr-1">${((parseFloat(li.quantity)||0)*(parseFloat(li.unit_price)||0)).toFixed(2)}</span>
              <button onClick={() => removeLine(i)} className="text-red-300 hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-violet-50 rounded-xl p-3 mb-3 grid grid-cols-2 gap-2 text-sm">
        <span className="text-gray-500">Subtotal</span><span className="text-right font-mono font-bold">${subtotal.toFixed(2)}</span>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Discount</span>
          <Input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="h-6 w-20 rounded-lg border-violet-200 text-xs ml-auto" min={0} />
        </div>
        <span className="text-right font-mono text-red-400">−${(parseFloat(discount)||0).toFixed(2)}</span>
        <div className="flex items-center gap-1">
          <span className="text-gray-500">Tax</span>
          <Input type="number" value={tax} onChange={e => setTax(e.target.value)} className="h-6 w-20 rounded-lg border-violet-200 text-xs ml-auto" min={0} />
        </div>
        <span className="text-right font-mono text-green-600">+${(parseFloat(tax)||0).toFixed(2)}</span>
        <span className="font-black text-gray-800 text-base">Total</span>
        <span className="text-right font-black text-violet-700 text-base font-mono">${total.toFixed(2)}</span>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Internal notes or client-facing comments..."
          className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !title.trim()}
          className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-xl font-bold gap-2">
          <Check className="w-4 h-4" />{saving ? "Saving…" : estimate ? "Update" : "Create Estimate"}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Estimates() {
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingEstimate, setEditing] = useState(null);
  const [ownerId, setOwnerId]         = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: estimates = [], isLoading } = useQuery({
    queryKey: ["estimates"],
    queryFn: () => base44.entities.Estimate.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Estimate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["estimates"] }),
  });

  const filtered = estimates.filter(e =>
    e.title?.toLowerCase().includes(search.toLowerCase()) ||
    e.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    e.status?.includes(search.toLowerCase())
  );

  const handleEdit = (est) => { setEditing(est); setShowForm(true); };
  const handleNew  = () => { setEditing(null); setShowForm(true); };
  const handleDone = () => {
    setShowForm(false); setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["estimates"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-5xl pb-24 lg:pb-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="p-2 rounded-full hover:bg-white/60 transition-colors">
                <ChevronLeft className="w-5 h-5 text-violet-600" />
              </button>
            </Link>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-5 py-2.5 rounded-2xl">
                <h1 className="text-xl font-black flex items-center gap-2"><FileText className="w-5 h-5" /> Estimates</h1>
              </div>
            </div>
          </div>
          <Button onClick={handleNew}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-5 font-bold shadow-lg gap-2">
            <Plus className="w-4 h-4" /> New Estimate
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by title, client or status..."
            className="pl-9 rounded-2xl border-2 border-violet-100 focus:border-violet-400 bg-white/70 backdrop-blur" />
        </motion.div>

        {/* Inline form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-5">
              <EstimateForm
                estimate={editingEstimate}
                clients={clients}
                ownerId={ownerId}
                onCancel={() => { setShowForm(false); setEditing(null); }}
                onSaved={handleDone}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && estimates.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-violet-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No estimates yet</p>
            <p className="text-gray-400 text-sm mb-5">Create an estimate before sending a contract.</p>
            <Button onClick={handleNew}
              className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-full px-6 font-bold gap-2">
              <Plus className="w-4 h-4" /> New Estimate
            </Button>
          </motion.div>
        )}

        {/* No search results */}
        {!isLoading && estimates.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No estimates match your search</p>
          </div>
        )}

        {/* Estimate cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence>
            {filtered.map((est, i) => (
              <motion.div key={est.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{est.title}</h3>
                    {est.client_name && (
                      <p className="text-xs text-gray-400 mt-0.5">{est.client_name}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => handleEdit(est)} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                      <Pencil className="w-4 h-4 text-violet-500" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(est.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge status={est.status} />
                  <span className="text-sm font-black text-violet-700 font-mono">${(est.total || 0).toFixed(2)}</span>
                </div>
                {est.valid_until && (
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Clock className="w-3 h-3" /> Valid until {est.valid_until}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
