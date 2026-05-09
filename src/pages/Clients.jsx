import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { pageMotion, cardMotion, staggerContainer, fadeIn } from "@/lib/motion";
import { Users, Plus, Search, Phone, Mail, FileText, Trash2, Pencil, Calendar, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import ClientForm from "@/components/salon/ClientForm";
import AppointmentPortal from "@/components/salon/AppointmentPortal";
import MobileNav from "@/components/layout/MobileNav";
import ClientLoyaltyStats from "@/components/salon/ClientLoyaltyStats";
import { getClientStats } from "@/lib/loyaltyUtils";

export default function Clients() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalClient, setPortalClient] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then((u) => setOwnerId(u?.id)); }, []);

  const { data: clients = [], isLoading } = useQuery({ queryKey: ["clients"], queryFn: () => base44.entities.Client.filter({ owner_id: ownerId }), enabled: !!ownerId });
  const { data: appointments = [] } = useQuery({ queryKey: ["appointments"], queryFn: () => base44.entities.Appointment.filter({ owner_id: ownerId }), enabled: !!ownerId });
  const { data: services = [] } = useQuery({ queryKey: ["services"], queryFn: () => base44.entities.Service.filter({ owner_id: ownerId }), enabled: !!ownerId });
  const { data: flexiDates = [] } = useQuery({ queryKey: ["flexiDates", ownerId], queryFn: () => base44.entities.FlexiDate.filter({ owner_id: ownerId }), enabled: !!ownerId });

  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.Client.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }) });

  const filtered = clients.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search) || c.email?.toLowerCase().includes(search.toLowerCase()));

  return (
    <motion.div className="min-h-screen bg-salon-glow pb-24 lg:pb-8" {...pageMotion}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/70 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></Link>
            <h1 className="text-2xl font-black text-gray-800">Clients</h1>
          </div>
          <Button onClick={() => { setEditingClient(null); setShowForm(true); }} className="bg-salon-gradient text-white rounded-full px-5 font-bold shadow-salon-soft hover:opacity-90 gap-2">
            <Plus className="w-4 h-4" /> New Client
          </Button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, phone or email..." className="pl-9 rounded-2xl border-2 border-salon-soft focus:border-[#D4A5A5] bg-white/70 backdrop-blur" />
        </div>

        {showForm && (
          <div className="mb-4">
            <ClientForm client={editingClient} ownerId={ownerId} onCancel={() => { setShowForm(false); setEditingClient(null); }} onSaved={() => { setShowForm(false); setEditingClient(null); queryClient.invalidateQueries({ queryKey: ["clients"] }); }} />
          </div>
        )}

        {isLoading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#EEF2FF] border-t-[#6366F1] rounded-full animate-spin mx-auto" /></div>}

        {!isLoading && clients.length === 0 && !showForm && (
          <motion.div className="text-center py-16" {...fadeIn}>
            <Users className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-400 mb-1">No clients yet</p>
            <p className="text-sm text-gray-300 mb-4">Add your first client to get started</p>
            <Button onClick={() => setShowForm(true)} className="bg-salon-gradient text-white rounded-full px-6 font-bold gap-2"><Plus className="w-4 h-4" /> Add Client</Button>
          </motion.div>
        )}

        {!isLoading && clients.length > 0 && filtered.length === 0 && <p className="text-center text-gray-400 py-8">No clients match your search</p>}

        <motion.div className="grid gap-3 sm:grid-cols-2" variants={staggerContainer} initial="initial" animate="animate">
          <AnimatePresence>
            {filtered.map((client, i) => {
              const stats = getClientStats(client.id, appointments);
              return (
                <motion.div key={client.id} variants={cardMotion} transition={{ ...cardMotion.transition, delay: i * 0.05 }} className="card-salon-glass rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-salon-gradient flex items-center justify-center text-white font-black shrink-0">{client.name?.[0]?.toUpperCase()}</div>
                      <div>
                        <h3 className="font-bold text-gray-800">{client.name}</h3>
                        {client.phone && <div className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3" />{client.phone}</div>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditingClient(client); setShowForm(true); }} className="p-1.5 rounded-lg hover:bg-[#EEF2FF] transition-colors"><Pencil className="w-3.5 h-3.5 text-[#6366F1]" /></button>
                      <button onClick={() => deleteMutation.mutate(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                    </div>
                  </div>
                  {client.email && <div className="flex items-center gap-1 text-xs text-gray-400 mb-1"><Mail className="w-3 h-3" />{client.email}</div>}
                  {client.notes && <div className="flex items-center gap-1 text-xs text-gray-400 mb-2"><FileText className="w-3 h-3" />{client.notes}</div>}
                  <ClientLoyaltyStats stats={stats} />
                  <Button onClick={() => { setPortalClient(client); setPortalOpen(true); }} size="sm" className="w-full mt-3 bg-salon-gradient text-white rounded-xl hover:opacity-90 gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Book Appointment
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        <AppointmentPortal open={portalOpen} onOpenChange={(v) => { setPortalOpen(v); if (!v) setPortalClient(null); }} initialClient={portalClient} appointments={appointments} services={services} clients={clients} flexiDates={flexiDates} onSaved={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })} onClientCreated={() => queryClient.invalidateQueries({ queryKey: ["clients"] })} />
      </div>
      <MobileNav />
    </motion.div>
  );
}
