import React, { useState, useEffect } from "react";
import { db, auth as sbAuth } from "@/api/dataAdapter";  // Phase 6: Supabase (fully migrated)
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    sbAuth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => db.entities.Client.filter({ owner_id: ownerId }),  // Supabase
    enabled: !!ownerId,
  });
  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => db.entities.Appointment.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => db.entities.Service.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });
  const { data: flexiDates = [] } = useQuery({
    queryKey: ["flexiDates"],
    queryFn: () => db.entities.FlexiDate.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => db.entities.Client.delete(id),  // Supabase
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const filtered = clients.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const getClientAppts = (clientId) => appointments.filter((a) => a.client_id === clientId);

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleFormDone = () => {
    setShowForm(false);
    setEditingClient(null);
    queryClient.invalidateQueries({ queryKey: ["clients"] });
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
                <h1 className="text-xl font-black flex items-center gap-2"><Users className="w-5 h-5" /> Clients</h1>
              </div>
            </div>
          </div>
          <Button
            onClick={() => { setEditingClient(null); setShowForm(true); }}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-5 font-bold shadow-lg gap-2"
          >
            <Plus className="w-4 h-4" /> New Client
          </Button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone or email..."
            className="pl-9 rounded-2xl border-2 border-violet-100 focus:border-violet-400 bg-white/70 backdrop-blur"
          />
        </motion.div>

        {/* Inline form */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-5">
              <ClientForm
                client={editingClient}
                ownerId={ownerId}
                onCancel={() => { setShowForm(false); setEditingClient(null); }}
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
        {!isLoading && clients.length === 0 && !showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="w-20 h-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-violet-300" />
            </div>
            <p className="text-gray-500 font-medium mb-1">No clients yet</p>
            <p className="text-gray-400 text-sm mb-5">Add your first client to get started</p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-full px-6 font-bold gap-2"
            >
              <Plus className="w-4 h-4" /> Add Client
            </Button>
          </motion.div>
        )}

        {/* No search results */}
        {!isLoading && clients.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No clients match your search</p>
          </div>
        )}

        {/* Client cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <AnimatePresence>
            {filtered.map((client, i) => {
              const stats = getClientStats(client.id, appointments);
              return (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white/70 backdrop-blur rounded-2xl p-5 shadow-sm border border-white flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-black text-lg shrink-0">
                        {client.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800">{client.name}</h3>
                        {client.phone && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Phone className="w-3 h-3 text-fuchsia-400 shrink-0" />{client.phone}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(client)} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                        <Pencil className="w-4 h-4 text-violet-500" />
                      </button>
                      <button onClick={() => deleteMutation.mutate(client.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  {/* Contact extras */}
                  <div className="space-y-1 mb-3">
                    {client.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                        <Mail className="w-3 h-3 text-fuchsia-400 shrink-0" />{client.email}
                      </div>
                    )}
                    {client.notes && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <FileText className="w-3 h-3 text-gray-300 shrink-0" />{client.notes}
                      </div>
                    )}
                  </div>

                  {/* Loyalty stats */}
                  <div className="mb-3 flex-1">
                    <ClientLoyaltyStats stats={stats} />
                  </div>

                  <Button
                    onClick={() => { setPortalClient(client); setPortalOpen(true); }}
                    size="sm"
                    className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl gap-2"
                  >
                    <Calendar className="w-3.5 h-3.5" /> Book Appointment
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      <AppointmentPortal
        open={portalOpen}
        onOpenChange={(v) => { setPortalOpen(v); if (!v) setPortalClient(null); }}
        initialClient={portalClient}
        appointments={appointments}
        services={services}
        clients={clients}
        flexiDates={flexiDates}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
        onClientCreated={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
      />
      <MobileNav />
    </div>
  );
}