import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Scissors, Plus, Clock, DollarSign, Trash2, Pencil, ChevronLeft, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { formatDuration, toTotalMinutes, splitDuration } from "@/lib/duration";
import MobileNav from "@/components/layout/MobileNav";

const COLOR_OPTIONS = [
  "#8b5cf6", "#ec4899", "#f97316", "#14b8a6", "#3b82f6", "#a855f7", "#ef4444", "#22c55e"
];

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
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white"
    >
      {/* Color bar */}
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
          <button onClick={() => onEdit(service)} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors">
            <Pencil className="w-4 h-4 text-violet-500" />
          </button>
          <button onClick={() => onDelete(service.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      {/* Inline editable price & duration */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 flex-1 bg-gray-50 rounded-xl px-3 py-2">
          <DollarSign className="w-4 h-4 text-green-500 shrink-0" />
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={handleBlur}
            className="w-full bg-transparent text-sm font-semibold text-gray-700 focus:outline-none"
            placeholder="Price"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-1 bg-gray-50 rounded-xl px-3 py-2">
          <Clock className="w-4 h-4 text-violet-400 shrink-0" />
          <input
            type="number"
            min="0"
            max="23"
            value={dHours}
            onChange={(e) => setDHours(e.target.value)}
            onBlur={handleBlur}
            className="w-10 bg-transparent text-sm text-gray-600 focus:outline-none text-center"
            placeholder="0"
          />
          <span className="text-xs text-gray-400 shrink-0">h</span>
          <input
            type="number"
            min="0"
            max="59"
            value={dMins}
            onChange={(e) => setDMins(e.target.value)}
            onBlur={handleBlur}
            className="w-10 bg-transparent text-sm text-gray-600 focus:outline-none text-center"
            placeholder="0"
          />
          <span className="text-xs text-gray-400 shrink-0">m</span>
        </div>
      </div>
      {updateMutation.isPending && (
        <p className="text-xs text-violet-400 mt-2">Saving...</p>
      )}
    </motion.div>
  );
}

function ServiceForm({ service, ownerId, onCancel, onSaved }) {
  const queryClient = useQueryClient();
  const { hours: initH, minutes: initM } = splitDuration(service?.duration);
  const [form, setForm] = useState({
    name: service?.name || "",
    price: service?.price || "",
    dHours: initH,
    dMins: initM,
    description: service?.description || "",
    color: service?.color || COLOR_OPTIONS[0],
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      service ? base44.entities.Service.update(service.id, data) : base44.entities.Service.create(data),
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
    <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur rounded-2xl p-5 shadow-sm border border-violet-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-800">{service ? "Edit Service" : "New Service"}</h3>
        <button type="button" onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl border-violet-100" placeholder="e.g. Haircut" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Price ($) *</label>
          <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required type="number" min="0" className="rounded-xl border-violet-100" placeholder="25" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration *</label>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 flex-1 border border-violet-100 rounded-xl px-3 py-2 bg-white">
              <input
                type="number"
                min="0"
                max="23"
                value={form.dHours}
                onChange={(e) => setForm({ ...form, dHours: e.target.value })}
                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none text-center"
                placeholder="0"
              />
              <span className="text-xs text-gray-400 shrink-0">h</span>
            </div>
            <div className="flex items-center gap-1 flex-1 border border-violet-100 rounded-xl px-3 py-2 bg-white">
              <input
                type="number"
                min="0"
                max="59"
                value={form.dMins}
                onChange={(e) => setForm({ ...form, dMins: e.target.value })}
                className="w-full bg-transparent text-sm text-gray-700 focus:outline-none text-center"
                placeholder="0"
              />
              <span className="text-xs text-gray-400 shrink-0">m</span>
            </div>
          </div>
          {toTotalMinutes(form.dHours, form.dMins) > 0 && (
            <p className="text-xs text-violet-500 mt-1">= {formatDuration(toTotalMinutes(form.dHours, form.dMins))}</p>
          )}
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border-violet-100" placeholder="Optional" />
        </div>
      </div>
      <div className="mb-4">
        <label className="text-xs font-semibold text-gray-500 mb-2 block">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLOR_OPTIONS.map((c) => (
            <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
              className="w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center"
              style={{ backgroundColor: c, borderColor: form.color === c ? "#1f2937" : "transparent" }}>
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

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: () => base44.entities.Service.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Service.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["services"] }),
  });

  const handleEdit = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingService(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
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
                <h1 className="text-xl font-black flex items-center gap-2"><Scissors className="w-5 h-5" /> Services</h1>
              </div>
            </div>
          </div>
          <Button
            onClick={() => { setEditingService(null); setShowForm(true); }}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-5 font-bold shadow-lg gap-2"
          >
            <Plus className="w-4 h-4" /> New Service
          </Button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-6">
              <ServiceForm
                service={editingService}
                ownerId={ownerId}
                onCancel={handleFormDone}
                onSaved={handleFormDone}
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
        {!isLoading && services.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-10 h-10 text-violet-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No services yet</p>
            <p className="text-gray-400 text-sm mb-5">Add your first service to start booking appointments</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-full px-6 font-bold gap-2"
            >
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </motion.div>
        )}

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          <AnimatePresence>
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onEdit={handleEdit}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <MobileNav />
    </div>
  );
}