import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { pageMotion, cardMotion, staggerContainer, fadeIn } from "@/lib/motion";
import { Scissors, Plus, Clock, DollarSign, Trash2, Pencil, ChevronLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { formatDuration, toTotalMinutes, splitDuration } from "@/lib/duration";
import MobileNav from "@/components/layout/MobileNav";

const COLOR_OPTIONS = ["#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#3b82f6", "#a855f7", "#ef4444", "#22c55e"];

function ServiceCard({ service, onEdit, onDelete }) {
  const queryClient = useQueryClient();
  const [price, setPrice] = useState(service.price ?? "");
  const { hours: initH, minutes: initM } = splitDuration(service.duration);
  const [dHours, setDHours] = useState(initH);
  const [dMins, setDMins] = useState(initM);

  useEffect(() => {
    setPrice(service.price ?? "");
    const { hours, minutes } = splitDuration(service.duration);
    setDHours(hours);
    setDMins(minutes);
  }, [service.price, service.duration]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Service.update(service.id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  const handleBlur = () => {
    const p = Number(price);
    const d = toTotalMinutes(dHours, dMins);
    if (p >= 0 && d >= 5 && (p !== service.price || d !== service.duration)) {
      updateMutation.mutate({ price: p, duration: d });
    }
  };

  return (
    <motion.div layout variants={cardMotion} initial="initial" animate="animate" exit="exit" className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white">
      <div className="h-1.5 rounded-full mb-4" style={{ backgroundColor: service.color || "#8b5cf6" }} />
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (service.color || "#8b5cf6") + "22" }}>
            <Scissors className="w-5 h-5" style={{ color: service.color || "#8b5cf6" }} />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{service.name}</h3>
            {service.description && <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>}
          </div>
        </div>
        <div className="flex gap-1">
          <button onClick={() => onEdit(service)} className="p-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"><Pencil className="w-4 h-4 text-[#6366F1]" /></button>
          <button onClick={() => onDelete(service.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4 text-red-400" /></button>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-1 bg-gray-50 rounded-xl px-3 py-2">
          <DollarSign className="w-4 h-4 text-green-500 shrink-0" />
          <input type="number" min="0" value={price} onChange={(e) => setPrice(e.target.value)} onBlur={handleBlur} className="w-full bg-transparent text-sm font-semibold text-gray-700 focus:outline-none" placeholder="Price" />
        </div>
        <div className="flex items-center gap-1.5 flex-1 bg-gray-50 rounded-xl px-3 py-2">
          <Clock className="w-4 h-4 text-[#6366F1] shrink-0" />
          <input type="number" min="0" max="23" value={dHours} onChange={(e) => setDHours(e.target.value)} onBlur={handleBlur} className="w-10 bg-transparent text-sm text-gray-600 focus:outline-none text-center" placeholder="0" />
          <span className="text-xs text-gray-400 shrink-0">h</span>
          <input type="number" min="0" max="59" value={dMins} onChange={(e) => setDMins(e.target.value)} onBlur={handleBlur} className="w-10 bg-transparent text-sm text-gray-600 focus:outline-none text-center" placeholder="0" />
          <span className="text-xs text-gray-400 shrink-0">m</span>
        </div>
      </div>
      {updateMutation.isPending && <p className="text-xs text-[#6366F1] mt-2">Saving...</p>}
    </motion.div>
  );
}

function ServiceForm({ service, ownerId, onCancel, onSaved }) {
  const queryClient = useQueryClient();
  const { hours: initH, minutes: initM } = splitDuration(service?.duration);
  const [form, setForm] = useState({ name: service?.name || "", price: service?.price || "", dHours: initH, dMins: initM, description: service?.description || "", color: service?.color || COLOR_OPTIONS[0] });

  const saveMutation = useMutation({
    mutationFn: (data) => service ? base44.entities.Service.update(service.id, data) : base44.entities.Service.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["services"] }); onSaved(); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const duration = toTotalMinutes(form.dHours, form.dMins);
    if (duration < 5) return;
    const { dHours, dMins, ...rest } = form;
    const payload = { ...rest, price: Number(form.price), duration };
    if (!service && ownerId) payload.owner_id = ownerId;
    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-salon-soft mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{service ? "Edit Service" : "New Service"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100"><X className="w-4 h-4 text-gray-400" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl border-salon-soft" placeholder="e.g. Haircut" /></div>
        <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Price ($) *</label><Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required type="number" min="0" className="rounded-xl border-salon-soft" placeholder="25" /></div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration *</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1 border border-salon-soft rounded-xl px-3 py-2 bg-white">
              <input type="number" min="0" max="23" value={form.dHours} onChange={(e) => setForm({ ...form, dHours: e.target.value })} className="w-full bg-transparent text-sm text-gray-700 focus:outline-none text-center" placeholder="0" />
              <span className="text-xs text-gray-400 shrink-0">h</span>
            </div>
            <div className="flex items-center gap-1 flex-1 border border-salon-soft rounded-xl px-3 py-2 bg-white">
              <input type="number" min="0" max="59" value={form.dMins} onChange={(e) => setForm({ ...form, dMins: e.target.value })} className="w-full bg-transparent text-sm text-gray-700 focus:outline-none text-center" placeholder="0" />
              <span className="text-xs text-gray-400 shrink-0">m</span>
            </div>
          </div>
          {toTotalMinutes(form.dHours, form.dMins) > 0 && <p className="text-xs text-[#6366F1] mt-1">= {formatDuration(toTotalMinutes(form.dHours, form.dMins))}</p>}
        </div>
        <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border-salon-soft" placeholder="Optional" /></div>
      </div>
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 mb-2 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })} className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center" style={{ backgroundColor: c, borderColor: form.color === c ? "#1f2937" : "transparent" }}>
              {form.color === c && <Check className="w-3.5 h-3.5 text-white" />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-xl">
          {saveMutation.isPending ? "Saving..." : service ? "Update Service" : "Add Service"}
        </Button>
      </div>
    </form>
  );
}

export default function Services() {
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then((u) => setOwnerId(u?.id)); }, []);

  const { data: services = [], isLoading } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.filter({ owner_id: ownerId }), enabled: !!ownerId });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Service.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }) });

  return (
    <motion.div className="min-h-screen bg-salon-glow pb-24 lg:pb-8" {...pageMotion}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/70 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></Link>
            <h1 className="text-2xl font-black text-gray-800">Services</h1>
          </div>
          <Button onClick={() => { setEditingService(null); setShowForm(true); }} className="bg-salon-gradient text-white rounded-full px-5 font-bold shadow-salon-soft hover:opacity-90 gap-2">
            <Plus className="w-4 h-4" /> New Service
          </Button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div key="service-form" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
              <ServiceForm service={editingService} ownerId={ownerId} onCancel={() => { setShowForm(false); setEditingService(null); }} onSaved={() => { setShowForm(false); setEditingService(null); }} />
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#EEF2FF] border-t-[#6366F1] rounded-full animate-spin mx-auto" /></div>}

        {!isLoading && services.length === 0 && !showForm && (
          <motion.div className="text-center py-16" {...fadeIn}>
            <Scissors className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-400 mb-1">No services yet</p>
            <p className="text-sm text-gray-300 mb-4">Add your first service to start booking appointments</p>
            <Button onClick={() => setShowForm(true)} className="bg-salon-gradient text-white rounded-full px-6 font-bold gap-2"><Plus className="w-4 h-4" /> Add Service</Button>
          </motion.div>
        )}

        <motion.div className="grid gap-3 sm:grid-cols-2" variants={staggerContainer} initial="initial" animate="animate">
          <AnimatePresence>
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onEdit={(s) => { setEditingService(s); setShowForm(true); }} onDelete={(id) => deleteMutation.mutate(id)} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
      <MobileNav />
    </motion.div>
  );
}
