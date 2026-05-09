import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScrollText, Plus, Search, Trash2, Pencil, ChevronLeft,
  Check, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import MobileNav from "@/components/layout/MobileNav";

// ── Status badge ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  draft:     { label: "Draft",     cls: "bg-gray-100 text-gray-500"     },
  sent:      { label: "Sent",      cls: "bg-blue-100 text-blue-600"     },
  signed:    { label: "Signed",    cls: "bg-green-100 text-green-600"   },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-500"       },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.draft;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}

// ── Inline form ───────────────────────────────────────────────────────────────
function ContractForm({ contract, clients, estimates, ownerId, onCancel, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [title, setTitle]             = useState(contract?.title || "");
  const [clientId, setClientId]       = useState(contract?.client_id || "");
  const [clientName, setClientName]   = useState(contract?.client_name || "");
  const [estimateId, setEstimateId]   = useState(contract?.estimate_id || "");
  const [status, setStatus]           = useState(contract?.status || "draft");
  const [contractText, setContractText] = useState(contract?.contract_text || "");
  const [terms, setTerms]             = useState(contract?.terms || "");
  const [startDate, setStartDate]     = useState(contract?.start_date || today);
  const [endDate, setEndDate]         = useState(contract?.end_date || "");
  const [notes, setNotes]             = useState(contract?.notes || "");
  const [saving, setSaving]           = useState(false);

  const handleClientChange = (id) => {
    setClientId(id);
    const c = clients.find(c => c.id === id);
    setClientName(c?.name || "");
  };

  // Prefill client from approved estimate when selected
  const handleEstimateChange = (id) => {
    setEstimateId(id);
    if (!id) return;
    const est = estimates.find(e => e.id === id);
    if (!est) return;
    // Only prefill if client/title fields are still empty
    if (!clientId && est.client_id) { setClientId(est.client_id); setClientName(est.client_name || ""); }
    if (!title && est.title) setTitle(est.title);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      owner_id: ownerId, title: title.trim(),
      client_id: clientId || null, client_name: clientName || null,
      estimate_id: estimateId || null,
      status, contract_text: contractText.trim() || null,
      terms: terms.trim() || null,
      start_date: startDate || null, end_date: endDate || null,
      notes: notes.trim() || null,
      updated_date: today,
      ...(contract ? {} : { created_date: today }),
    };
    try {
      if (contract?.id) {
        await base44.entities.Contract.update(contract.id, payload);
      } else {
        await base44.entities.Contract.create(payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  // Approved estimates only (useful for prefill)
  const approvedEstimates = estimates.filter(e => e.status === "approved");

  return (
    <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-md border border-violet-100">
      <h2 className="font-black text-gray-800 mb-4">{contract ? "Edit Contract" : "New Contract"}</h2>

      {/* Title + Client */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Title *</label>
          <Input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Service Agreement — May 2026" className="rounded-xl border-violet-200" />
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

      {/* Estimate link + Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Link to Approved Estimate <span className="text-gray-300">(optional)</span>
          </label>
          <select value={estimateId} onChange={e => handleEstimateChange(e.target.value)}
            className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
            <option value="">— None —</option>
            {approvedEstimates.map(e => <option key={e.id} value={e.id}>{e.title}{e.client_name ? ` · ${e.client_name}` : ""}</option>)}
          </select>
          {estimates.length > 0 && approvedEstimates.length === 0 && (
            <p className="text-[10px] text-amber-500 mt-1">No approved estimates yet. Approve an estimate first.</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
            {Object.keys(STATUS_STYLES).map(k => <option key={k} value={k}>{STATUS_STYLES[k].label}</option>)}
          </select>
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Start Date</label>
          <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="rounded-xl border-violet-200" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">End Date <span className="text-gray-300">(optional)</span></label>
          <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="rounded-xl border-violet-200" />
        </div>
      </div>

      {/* Contract text */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Contract Body</label>
        <textarea value={contractText} onChange={e => setContractText(e.target.value)} rows={4}
          placeholder="Main body of the contract..."
          className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      {/* Terms */}
      <div className="mb-3">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Terms & Conditions</label>
        <textarea value={terms} onChange={e => setTerms(e.target.value)} rows={3}
          placeholder="Payment terms, cancellation policy, etc..."
          className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Internal Notes</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
          placeholder="Internal notes (not visible to client)..."
          className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button onClick={handleSave} disabled={saving || !title.trim()}
          className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-xl font-bold gap-2">
          <Check className="w-4 h-4" />{saving ? "Saving…" : contract ? "Update" : "Create Contract"}
        </Button>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Contracts() {
  const [search, setSearch]           = useState("");
  const [showForm, setShowForm]       = useState(false);
  const [editingContract, setEditing] = useState(null);
  const [ownerId, setOwnerId]         = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ["contracts"],
    queryFn: () => base44.entities.Contract.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const { data: estimates = [] } = useQuery({
    queryKey: ["estimates"],
    queryFn: () => base44.entities.Estimate.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Contract.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["contracts"] }),
  });

  const filtered = contracts.filter(c =>
    c.title?.toLowerCase().includes(search.toLowerCase()) ||
    c.client_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.status?.includes(search.toLowerCase())
  );

  const handleEdit = (c) => { setEditing(c); setShowForm(true); };
  const handleNew  = () => { setEditing(null); setShowForm(true); };
  const handleDone = () => {
    setShowForm(false); setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["contracts"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
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
                <h1 className="text-xl font-black flex items-center gap-2"><ScrollText className="w-5 h-5" /> Contracts</h1>
              </div>
            </div>
          </div>
          <Button onClick={handleNew}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-5 font-bold shadow-lg gap-2">
            <Plus className="w-4 h-4" /> New Contract
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
              <ContractForm
                contract={editingContract}
                clients={clients}
                estimates={estimates}
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
        {!isLoading && contracts.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ScrollText className="w-10 h-10 text-violet-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No contracts yet</p>
            <p className="text-gray-400 text-sm mb-5">Create a contract from scratch or connect it to an approved estimate.</p>
            <Button onClick={handleNew}
              className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-full px-6 font-bold gap-2">
              <Plus className="w-4 h-4" /> New Contract
            </Button>
          </motion.div>
        )}

        {/* No results */}
        {!isLoading && contracts.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No contracts match your search</p>
          </div>
        )}

        {/* Contract cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence>
            {filtered.map((c, i) => (
              <motion.div key={c.id}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: i * 0.04 }}
                className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">{c.title}</h3>
                    {c.client_name && <p className="text-xs text-gray-400 mt-0.5">{c.client_name}</p>}
                  </div>
                  <div className="flex gap-1 ml-2 shrink-0">
                    <button onClick={() => handleEdit(c)} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                      <Pencil className="w-4 h-4 text-violet-500" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <StatusBadge status={c.status} />
                <div className="flex flex-col gap-1 text-[10px] text-gray-400">
                  {c.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> Start: {c.start_date}
                      {c.end_date && ` → ${c.end_date}`}
                    </div>
                  )}
                  {c.estimate_id && (
                    <div className="flex items-center gap-1 text-violet-400">
                      <Check className="w-3 h-3" /> Linked to estimate
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
