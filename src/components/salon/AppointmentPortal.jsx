import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Check, X, Scissors } from "lucide-react";
import { formatDuration } from "@/lib/duration";
import { Link } from "react-router-dom";
import { getTimeSlots, formatDateStr } from "@/lib/bookingUtils";
import { useSettings } from "@/lib/SettingsContext";

const STEP_MOTION = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  exit:    { opacity: 0, x: -16 },
  transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
};

function Steps({ current, steps }) {
  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold transition-all ${i === current ? "bg-white/25 text-white" : i < current ? "bg-white/15 text-white/80" : "bg-white/10 text-white/50"}`}>
            {i < current ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
            <span className="hidden sm:inline">{s}</span>
          </div>
          {i < steps.length - 1 && <div className="flex-1 h-0.5 bg-white/20 rounded-full min-w-[8px]" />}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function AppointmentPortal({ open, onOpenChange, initialDate, initialClient, appointments = [], services = [], clients = [], flexiDates = [], onSaved, onClientCreated }) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [ownerId, setOwnerId] = useState(null);
  const [step, setStep] = useState(0);
  const [clientMode, setClientMode] = useState("select");
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [newClient, setNewClient] = useState({ name: "", phone: "", email: "", notes: "" });
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(initialDate || new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [notes, setNotes] = useState("");

  useEffect(() => { base44.auth.me().then((u) => setOwnerId(u?.id)); }, []);

  useEffect(() => {
    if (open) {
      setStep(initialClient ? 1 : 0);
      setSelectedClient(initialClient || null);
      setSelectedDate(initialDate || new Date());
      setSelectedServices([]);
      setSelectedTime(null);
      setNotes("");
      setSearch("");
      setClientMode("select");
      setNewClient({ name: "", phone: "", email: "", notes: "" });
    }
  }, [open, initialDate, initialClient]);

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      if (onClientCreated) onClientCreated();
      setSelectedClient(client);
      setStep(1);
    },
  });

  const saveAppointmentMutation = useMutation({
    mutationFn: (data) => base44.entities.Appointment.create(data),
    onSuccess: () => { if (onSaved) onSaved(); onOpenChange(false); },
  });

  const totalDuration = selectedServices.reduce((s, svc) => s + (svc.duration || 0), 0);
  const totalPrice = selectedServices.reduce((s, svc) => s + (svc.price || 0), 0);
  const timeSlots = selectedDate ? getTimeSlots(settings, selectedDate, flexiDates, appointments, totalDuration || 30) : [];
  const filteredClients = clients.filter((c) => c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search));

  const toggleService = (svc) => {
    setSelectedServices((prev) => prev.find((s) => s.id === svc.id) ? prev.filter((s) => s.id !== svc.id) : [...prev, svc]);
    setSelectedTime(null);
  };

  const handleSaveNewClient = (e) => {
    e.preventDefault();
    const payload = { ...newClient };
    if (ownerId) payload.owner_id = ownerId;
    createClientMutation.mutate(payload);
  };

  const handleSave = async () => {
    if (ownerId) {
      const liveAppts = await base44.entities.Appointment.filter({ owner_id: ownerId });
      const freshSlots = getTimeSlots(settings, selectedDate, flexiDates, liveAppts, totalDuration || 30);
      if (!freshSlots.includes(selectedTime)) {
        alert("This time slot was just taken. Please select another time.");
        setStep(2); setSelectedTime(null); return;
      }
    }
    saveAppointmentMutation.mutate({
      client_id: selectedClient.id, client_name: selectedClient.name,
      service_ids: selectedServices.map((s) => s.id), service_names: selectedServices.map((s) => s.name),
      date: formatDateStr(selectedDate), time: selectedTime,
      duration_total: totalDuration, total_price: totalPrice,
      status: "confirmed", source: "admin", notes,
      ...(ownerId ? { owner_id: ownerId } : {}),
    });
  };

  const today = new Date();
  const next14 = Array.from({ length: 14 }, (_, i) => addDays(today, i));
  const steps = ["Client", "Services", "Date & Time", "Confirm"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-full sm:rounded-3xl p-0 overflow-hidden border-0 shadow-2xl [&>button]:hidden max-h-[95dvh]">
        <div className="bg-salon-gradient p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <DialogTitle className="text-xl font-black">New Appointment</DialogTitle>
            <DialogDescription className="sr-only">Book a new appointment.</DialogDescription>
            <button onClick={() => onOpenChange(false)} className="p-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"><X className="w-4 h-4" /></button>
          </div>
          <Steps current={step} steps={steps} />
        </div>

        <div className="p-4 sm:p-5 overflow-y-auto" style={{ maxHeight: "calc(95dvh - 140px)" }}>
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-0" {...STEP_MOTION}>
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setClientMode("select")} className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${clientMode === "select" ? "border-[#D4A5A5] bg-[#F4E8EA] text-[#9D5C63]" : "border-gray-100 text-gray-400"}`}>Existing Client</button>
                  <button onClick={() => setClientMode("create")} className={`flex-1 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${clientMode === "create" ? "border-[#D4A5A5] bg-[#F4E8EA] text-[#9D5C63]" : "border-gray-100 text-gray-400"}`}><Plus className="w-3.5 h-3.5 inline mr-1" />New Client</button>
                </div>
                {clientMode === "select" && (
                  <div>
                    <div className="relative mb-3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name or phone..." className="pl-9 rounded-xl border-salon-soft" /></div>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {filteredClients.length === 0 && <p className="text-center text-gray-400 py-6 text-sm">{clients.length === 0 ? "No clients yet. Create one first." : "No clients match your search."}</p>}
                      {filteredClients.map((c) => (
                        <button key={c.id} onClick={() => setSelectedClient(c)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${selectedClient?.id === c.id ? "border-[#D4A5A5] bg-[#F4E8EA]" : "border-gray-100 hover:border-[#D4A5A5]"}`}>
                          <div className="w-8 h-8 rounded-full bg-salon-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">{c.name?.[0]?.toUpperCase()}</div>
                          <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm">{c.name}</p><p className="text-xs text-gray-400">{c.phone}</p></div>
                          {selectedClient?.id === c.id && <Check className="w-4 h-4 text-[#9D5C63] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {clientMode === "create" && (
                  <form onSubmit={handleSaveNewClient} className="space-y-3">
                    <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label><Input value={newClient.name} onChange={(e) => setNewClient({ ...newClient, name: e.target.value })} required className="rounded-xl border-violet-100" placeholder="Full name" /></div>
                    <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Phone *</label><Input value={newClient.phone} onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })} required className="rounded-xl border-violet-100" placeholder="+1 555 000 0000" /></div>
                    <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label><Input value={newClient.email} onChange={(e) => setNewClient({ ...newClient, email: e.target.value })} type="email" className="rounded-xl border-violet-100" placeholder="email@example.com" /></div>
                    <Button type="submit" disabled={createClientMutation.isPending} className="w-full bg-salon-gradient text-white rounded-xl hover:opacity-90">{createClientMutation.isPending ? "Saving..." : "Save & Continue"}</Button>
                  </form>
                )}
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step-1" {...STEP_MOTION}>
                <p className="text-sm font-semibold text-gray-500 mb-3">Select one or more services</p>
                {services.length === 0 ? (
                  <div className="text-center py-8"><Scissors className="w-10 h-10 text-gray-200 mx-auto mb-2" /><p className="text-sm text-gray-400 mb-3">No services yet</p><Link to="/services" onClick={() => onOpenChange(false)} className="text-salon-primary font-semibold text-sm">Go to Services →</Link></div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {services.map((svc) => {
                      const isSelected = !!selectedServices.find((s) => s.id === svc.id);
                      return (
                        <button key={svc.id} onClick={() => toggleService(svc)} className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${isSelected ? "border-[#D4A5A5] bg-[#F4E8EA]" : "border-gray-100 hover:border-[#D4A5A5]"}`}>
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: svc.color || "#8b5cf6" }} />
                          <div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 text-sm">{svc.name}</p></div>
                          <span className="text-xs text-gray-500">${svc.price}</span>
                          <span className="text-xs text-gray-400">{formatDuration(svc.duration)}</span>
                          {isSelected && <Check className="w-4 h-4 text-[#9D5C63] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {selectedServices.length > 0 && <p className="text-xs text-gray-500 mt-3 text-center">{selectedServices.length} service(s) · {formatDuration(totalDuration)} · ${totalPrice}</p>}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-2" {...STEP_MOTION}>
                <p className="text-xs font-semibold text-gray-500 mb-2">Select Date</p>
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {next14.map((d) => {
                    const isSelected = formatDateStr(d) === formatDateStr(selectedDate);
                    return (
                      <button key={d.toISOString()} onClick={() => { setSelectedDate(d); setSelectedTime(null); }} className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border-2 transition-all ${isSelected ? "border-[#D4A5A5] bg-[#F4E8EA] text-[#9D5C63]" : "border-gray-100 hover:border-[#D4A5A5] text-gray-600"}`}>
                        <span className="text-[10px] font-semibold">{format(d, "EEE")}</span>
                        <span className="text-base font-black">{format(d, "d")}</span>
                        <span className="text-[10px]">{format(d, "MMM")}</span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Select Time</p>
                {timeSlots.length === 0 ? <p className="text-center text-gray-400 py-4 text-sm">No available slots on this day. Try another date.</p> : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {timeSlots.map((slot) => (
                      <button key={slot} onClick={() => setSelectedTime(slot)} className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${slot === selectedTime ? "border-[#9D5C63] bg-[#9D5C63] text-white" : "border-gray-100 hover:border-[#D4A5A5] text-gray-700"}`}>{slot}</button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-3" {...STEP_MOTION} className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-[#EEF2FF] rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-salon-gradient flex items-center justify-center text-white font-bold">{selectedClient?.name?.[0]?.toUpperCase()}</div>
                  <div><p className="font-bold text-gray-800">{selectedClient?.name}</p><p className="text-xs text-gray-400">{selectedClient?.phone}</p></div>
                </div>
                <p className="text-sm text-gray-600"><span className="font-semibold">{format(selectedDate, "EEEE, MMMM d yyyy")}</span> at <strong>{selectedTime}</strong></p>
                <div className="space-y-1">
                  {selectedServices.map((s) => <div key={s.id} className="flex justify-between text-sm"><span>{s.name}</span><span className="font-semibold">${s.price}</span></div>)}
                  <div className="flex justify-between text-sm font-bold pt-1 border-t border-gray-100"><span>Total ({formatDuration(totalDuration)})</span><span>${totalPrice}</span></div>
                </div>
                <div><label className="text-xs font-semibold text-gray-500 mb-1 block">Notes (optional)</label><Input value={notes} onChange={(e) => setNotes(e.target.value)} className="rounded-xl border-salon-soft" placeholder="Any additional notes..." /></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-100 bg-white">
          {step > 0 ? <button onClick={() => setStep(step - 1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">← Back</button> : <div />}
          {step === 0 && clientMode === "select" && <Button onClick={() => setStep(1)} disabled={!selectedClient} className="bg-salon-gradient text-white rounded-xl px-6 hover:opacity-90 gap-2">Continue</Button>}
          {step === 1 && <Button onClick={() => setStep(2)} disabled={selectedServices.length === 0} className="bg-salon-gradient text-white rounded-xl px-6 hover:opacity-90">Continue</Button>}
          {step === 2 && <Button onClick={() => setStep(3)} disabled={!selectedTime} className="bg-salon-gradient text-white rounded-xl px-6 hover:opacity-90">Continue</Button>}
          {step === 3 && <Button onClick={handleSave} disabled={saveAppointmentMutation.isPending} className="bg-salon-gradient text-white rounded-xl px-6 hover:opacity-90">{saveAppointmentMutation.isPending ? "Saving..." : "Confirm Appointment"}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
