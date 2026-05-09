import React, { useState, useEffect } from "react";
import { db } from "@/api/dataAdapter";  // Phase 6: Supabase
import { format, addDays } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useParams } from "react-router-dom";
import {
  Clock, DollarSign, Check, ChevronRight, ArrowLeft, Calendar,
  Scissors, Phone, Mail, User, FileText, MapPin, Globe,
  CheckCircle2, AlertCircle, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDuration } from "@/lib/duration";
import { isDayAvailable, getTimeSlots, formatDateStr } from "@/lib/bookingUtils";

const STEPS = ["Services", "Date & Time", "Your Info", "Confirm"];

function StepBar({ step }) {
  return (
    <div className="flex items-center gap-1 mt-3">
      {STEPS.map((label, i) => (
        <React.Fragment key={i}>
          <div className="flex items-center gap-1.5">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all
              ${i < step ? "bg-white text-violet-600" : i === step ? "bg-white/30 text-white border-2 border-white" : "bg-white/10 text-white/40"}`}>
              {i < step ? <Check className="w-3 h-3" /> : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:inline transition-all ${i === step ? "text-white" : i < step ? "text-white/70" : "text-white/30"}`}>
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 rounded-full min-w-[10px] transition-all ${i < step ? "bg-white/60" : "bg-white/15"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default function BookingPortal() {
  const { businessSlug } = useParams();
  const slug = (businessSlug || "").trim();

  const [settings, setSettings] = useState(null);
  const [services, setServices] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [flexiDates, setFlexiDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [step, setStep] = useState(0);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [clientInfo, setClientInfo] = useState({ name: "", phone: "", email: "", notes: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!slug) { setNotFound(true); setLoading(false); return; }

    async function load() {
      // Find salon by booking_slug stored inside the JSONB `settings` column.
      // We use db.raw (Supabase client) because the standard adapter only supports
      // top-level column filters — JSONB path filters need the raw client.
      const { data: rows, error } = await db.raw
        .from("business_settings")
        .select("*")
        .filter("settings->>'booking_slug'", "eq", slug)
        .limit(1);

      if (error || !rows?.length) { setNotFound(true); setLoading(false); return; }

      const row = rows[0];
      const ownerId = row.owner_id;

      // Flatten: spread the JSONB `settings` blob + add top-level DB columns.
      // This preserves all existing settings.* JSX references unchanged.
      const flatSettings = { ...(row.settings || {}), owner_id: ownerId, id: row.id };
      setSettings(flatSettings);

      const [svcs, appts, flexi] = await Promise.all([
        db.entities.Service.filter({ owner_id: ownerId }),
        db.entities.Appointment.filter({ owner_id: ownerId }),
        db.entities.FlexiDate.filter({ owner_id: ownerId }).catch(() => []),
      ]);

      try {
        const gal = await db.entities.GalleryImage.filter({ owner_id: ownerId });
        setGallery(gal || []);
      } catch { /* gallery optional */ }

      setServices(svcs || []);
      setAppointments(appts || []);
      setFlexiDates(flexi || []);
      setLoading(false);
    }

    load().catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const totalDuration = selectedServices.reduce((s, sv) => s + (sv.duration || 0), 0);
  const totalPrice = selectedServices.reduce((s, sv) => s + (sv.price || 0), 0);

  // Next 21 days, filtered to open days only
  const availableDays = Array.from({ length: 21 }, (_, i) => addDays(new Date(), i))
    .filter((d) => isDayAvailable(d, settings, flexiDates));

  // Time slots for selected date — fully computed with flexi + appointments
  const timeSlots = selectedDate
    ? getTimeSlots(settings, selectedDate, flexiDates, appointments, totalDuration || 30)
    : [];

  const toggleService = (svc) => {
    setSelectedServices((prev) =>
      prev.find((s) => s.id === svc.id) ? prev.filter((s) => s.id !== svc.id) : [...prev, svc]
    );
    setSelectedTime(null);
  };

  const handleDateSelect = (d) => {
    setSelectedDate(d);
    setSelectedTime(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    const ownerId = settings.owner_id;
    const dateStr = formatDateStr(selectedDate);

    // Re-fetch live appointments to prevent double-booking race condition
    const freshAppts = await db.entities.Appointment.filter({ owner_id: ownerId });
    const freshSlots = getTimeSlots(settings, selectedDate, flexiDates, freshAppts, totalDuration);
    if (!freshSlots.includes(selectedTime)) {
      setSubmitError("Sorry, that time slot was just booked by someone else. Please choose another time.");
      setSubmitting(false);
      setStep(1);
      setSelectedTime(null);
      setAppointments(freshAppts);
      return;
    }

    // Find or create client record scoped to this business
    const allClients = await db.entities.Client.filter({ owner_id: ownerId });
    let client = allClients.find((c) => c.phone && c.phone === clientInfo.phone);
    if (!client && clientInfo.email) {
      client = allClients.find((c) => c.email && c.email === clientInfo.email);
    }

    if (client) {
      client = await db.entities.Client.update(client.id, {
        name: clientInfo.name,
        phone: clientInfo.phone,
        email: clientInfo.email || client.email,
        owner_id: ownerId,
      });
    } else {
      client = await db.entities.Client.create({
        name: clientInfo.name,
        phone: clientInfo.phone,
        email: clientInfo.email,
        notes: clientInfo.notes,
        owner_id: ownerId,
      });
    }

    await db.entities.Appointment.create({
      client_id: client.id,
      client_name: clientInfo.name,
      service_ids: selectedServices.map((s) => s.id),
      service_names: selectedServices.map((s) => s.name),
      date: dateStr,
      time: selectedTime,
      duration_total: totalDuration,
      total_price: totalPrice,
      status: "pending",
      source: "booking_portal",
      notes: clientInfo.notes,
      owner_id: ownerId,
    });

    setStep(4);
    setSubmitting(false);
  };

  // ── Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-violet-500 animate-spin" />
          <p className="text-gray-400 text-sm font-medium">Loading booking page...</p>
        </div>
      </div>
    );
  }

  // ── Not found
  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 to-fuchsia-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h1 className="text-xl font-black text-gray-800 mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm">This booking link is invalid or the business hasn't set up their booking page yet.</p>
        </div>
      </div>
    );
  }

  // ── Success
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md w-full">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
            className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-xl shadow-green-200"
          >
            <CheckCircle2 className="w-12 h-12 text-white" />
          </motion.div>
          <h1 className="text-2xl font-black text-gray-800 mb-2">Request Sent! 🎉</h1>
          <p className="text-gray-500 mb-5">
            <strong>{settings.business_name || settings.display_name}</strong> will review and confirm your appointment.
          </p>

          <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm border border-white text-left space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-black shrink-0">
                {clientInfo.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-gray-800">{clientInfo.name}</p>
                <p className="text-sm text-gray-400">{clientInfo.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-violet-50 rounded-xl px-3 py-2.5">
              <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
              <span>{format(selectedDate, "EEEE, MMMM d, yyyy")} at <strong>{selectedTime}</strong></span>
            </div>
            <div className="text-sm text-gray-600">
              {selectedServices.map((s) => s.name).join(", ")} · {formatDuration(totalDuration)} · ${totalPrice}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-6 text-left">
            ⏳ Your slot is <strong>temporarily held</strong> while awaiting confirmation. You'll hear back soon!
          </div>

          <Button
            onClick={() => {
              setStep(0);
              setSelectedServices([]);
              setSelectedDate(null);
              setSelectedTime(null);
              setClientInfo({ name: "", phone: "", email: "", notes: "" });
            }}
            className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl h-12 font-bold"
          >
            Book Another Appointment
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-4">
          <div className="flex items-center gap-4">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="logo" className="w-12 h-12 rounded-2xl object-cover bg-white/20 shrink-0" />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                <Scissors className="w-6 h-6" />
              </div>
            )}
            <div>
              <h1 className="text-xl font-black leading-tight">{settings.business_name || settings.display_name || "Book Appointment"}</h1>
              {settings.slogan && <p className="text-white/80 text-sm">{settings.slogan}</p>}
            </div>
          </div>

          {settings.description && (
            <p className="mt-3 text-white/80 text-sm leading-relaxed">{settings.description}</p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            {settings.address && (
              <span className="flex items-center gap-1 text-xs bg-white/15 rounded-full px-3 py-1">
                <MapPin className="w-3 h-3" />{settings.address}
              </span>
            )}
            {settings.phone && (
              <span className="flex items-center gap-1 text-xs bg-white/15 rounded-full px-3 py-1">
                <Phone className="w-3 h-3" />{settings.phone}
              </span>
            )}
            {settings.website && (
              <a href={settings.website} target="_blank" rel="noreferrer"
                className="flex items-center gap-1 text-xs bg-white/15 rounded-full px-3 py-1 hover:bg-white/25 transition-colors">
                <Globe className="w-3 h-3" />Website
              </a>
            )}
          </div>

          <StepBar step={step} />
        </div>
      </div>

      {/* Gallery strip */}
      {gallery.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pt-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {gallery.slice(0, 8).map((photo) => (
              <img key={photo.id} src={photo.image_url} alt={photo.title || ""}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border-2 border-white shadow-sm" />
            ))}
          </div>
        </div>
      )}

      {/* Error banner */}
      <AnimatePresence>
        {submitError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto px-4 pt-3"
          >
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{submitError}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Steps */}
      <div className="max-w-2xl mx-auto px-4 py-5 pb-12">
        <AnimatePresence mode="wait">

          {/* STEP 0: Services */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">Step 1 of 4</p>
              <h2 className="text-xl font-black text-gray-800 mb-1">Choose Services</h2>
              <p className="text-sm text-gray-500 mb-4">Select one or more services for your appointment</p>

              {services.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white/60 rounded-2xl border-2 border-dashed border-gray-200">
                  <Scissors className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No services available yet.</p>
                  <p className="text-sm mt-1">Check back soon!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((svc) => {
                    const selected = !!selectedServices.find((s) => s.id === svc.id);
                    return (
                      <button key={svc.id} onClick={() => toggleService(svc)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 bg-white/80 backdrop-blur active:scale-[0.98]
                          ${selected ? "border-violet-400 shadow-md shadow-violet-100 bg-violet-50/50" : "border-white hover:border-violet-200 shadow-sm"}`}>
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative" style={{ backgroundColor: (svc.color || "#8b5cf6") + "22" }}>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: svc.color || "#8b5cf6" }} />
                          {selected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800">{svc.name}</p>
                          {svc.description && <p className="text-xs text-gray-400 mt-0.5 truncate">{svc.description}</p>}
                          <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-500">
                            <span className="flex items-center gap-1 font-semibold text-green-600">
                              <DollarSign className="w-3.5 h-3.5" />{svc.price}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-violet-400" />{formatDuration(svc.duration)}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedServices.length > 0 && (
                <div className="mt-4 p-3 bg-violet-50 rounded-xl border border-violet-100 flex items-center justify-between">
                  <p className="text-sm text-violet-700 font-semibold">
                    {selectedServices.length} service{selectedServices.length > 1 ? "s" : ""} · {formatDuration(totalDuration)}
                  </p>
                  <p className="text-sm font-black text-violet-700">${totalPrice}</p>
                </div>
              )}

              <Button disabled={selectedServices.length === 0} onClick={() => setStep(1)}
                className="w-full mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl h-12 font-bold text-base gap-2 disabled:opacity-40">
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* STEP 1: Date & Time */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(0)} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">Step 2 of 4</p>
              <h2 className="text-xl font-black text-gray-800 mb-1">Pick a Date & Time</h2>
              <p className="text-sm text-gray-500 mb-4">Only available slots are shown</p>

              {availableDays.length === 0 ? (
                <div className="text-center py-10 bg-white/60 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No available days in the next 3 weeks.</p>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
                  {availableDays.map((d) => {
                    const isSelected = selectedDate && formatDateStr(d) === formatDateStr(selectedDate);
                    return (
                      <button key={d.toISOString()} onClick={() => handleDateSelect(d)}
                        className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl border-2 transition-all min-w-[64px] active:scale-95
                          ${isSelected ? "border-violet-400 bg-violet-500 text-white shadow-lg shadow-violet-200" : "border-white bg-white/80 hover:border-violet-200 text-gray-600 shadow-sm"}`}>
                        <span className="text-[10px] font-bold uppercase">{format(d, "EEE")}</span>
                        <span className="text-xl font-black my-0.5">{format(d, "d")}</span>
                        <span className="text-[10px]">{format(d, "MMM")}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedDate && (
                <>
                  <h3 className="text-base font-bold text-gray-800 mb-3">
                    Available Times — {format(selectedDate, "EEEE, MMM d")}
                  </h3>
                  {timeSlots.length === 0 ? (
                    <div className="text-center py-8 bg-amber-50 border border-amber-100 rounded-2xl text-amber-700">
                      <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="font-semibold">No available times on this day.</p>
                      <p className="text-sm text-amber-600 mt-1">All slots are booked or the business is closed. Please pick another date.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {timeSlots.map((slot) => {
                        const isSelected = slot === selectedTime;
                        return (
                          <button key={slot} onClick={() => setSelectedTime(slot)}
                            className={`py-3 rounded-xl text-sm font-bold border-2 transition-all active:scale-95
                              ${isSelected ? "border-violet-500 bg-violet-500 text-white shadow-lg shadow-violet-200" : "border-white bg-white/80 hover:border-violet-300 text-gray-700 shadow-sm"}`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              <Button disabled={!selectedDate || !selectedTime} onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl h-12 font-bold text-base gap-2 disabled:opacity-40">
                Continue <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* STEP 2: Client Info */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(1)} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">Step 3 of 4</p>
              <h2 className="text-xl font-black text-gray-800 mb-1">Your Information</h2>
              <p className="text-sm text-gray-500 mb-5">A few details to complete your booking</p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <User className="w-3.5 h-3.5" />Full Name *
                  </label>
                  <Input value={clientInfo.name}
                    onChange={(e) => setClientInfo({ ...clientInfo, name: e.target.value })}
                    className="rounded-2xl border-2 border-white bg-white/80 h-12 text-base focus:border-violet-300"
                    placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5" />Phone Number *
                  </label>
                  <Input value={clientInfo.phone}
                    onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                    className="rounded-2xl border-2 border-white bg-white/80 h-12 text-base focus:border-violet-300"
                    placeholder="+1 555 000 0000" type="tel" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <Mail className="w-3.5 h-3.5" />Email <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <Input value={clientInfo.email}
                    onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                    className="rounded-2xl border-2 border-white bg-white/80 h-12 text-base focus:border-violet-300"
                    placeholder="your@email.com" type="email" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />Notes <span className="text-gray-300 font-normal">(optional)</span>
                  </label>
                  <textarea value={clientInfo.notes}
                    onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                    rows={3} placeholder="Anything we should know..."
                    className="w-full rounded-2xl border-2 border-white bg-white/80 px-4 py-3 text-sm focus:outline-none focus:border-violet-300 resize-none" />
                </div>
              </div>

              <Button disabled={!clientInfo.name.trim() || !clientInfo.phone.trim()} onClick={() => setStep(3)}
                className="w-full mt-5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-2xl h-12 font-bold text-base gap-2 disabled:opacity-40">
                Review Booking <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}

          {/* STEP 3: Confirm */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <button onClick={() => setStep(2)} className="flex items-center gap-1 text-sm text-gray-400 mb-4 hover:text-gray-600 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <p className="text-xs font-bold text-violet-500 uppercase tracking-wider mb-1">Step 4 of 4</p>
              <h2 className="text-xl font-black text-gray-800 mb-4">Confirm Your Booking</h2>

              <div className="bg-white/80 backdrop-blur rounded-2xl p-5 border-2 border-violet-100 shadow-sm space-y-4 mb-4">
                {/* Client */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white font-black shrink-0">
                    {clientInfo.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{clientInfo.name}</p>
                    <p className="text-sm text-gray-400">{clientInfo.phone}</p>
                  </div>
                </div>

                {/* Date/Time */}
                <div className="flex items-center gap-2 text-sm text-gray-700 bg-violet-50 rounded-xl px-3 py-2.5">
                  <Calendar className="w-4 h-4 text-violet-500 shrink-0" />
                  <span>{format(selectedDate, "EEEE, MMMM d, yyyy")} at <strong>{selectedTime}</strong></span>
                </div>

                {/* Services */}
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">{s.name}</span>
                      <span className="font-semibold">${s.price}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 pt-2 flex justify-between font-bold">
                    <span className="text-gray-700">Total · {formatDuration(totalDuration)}</span>
                    <span className="text-violet-600">${totalPrice}</span>
                  </div>
                </div>

                {clientInfo.notes && (
                  <p className="text-sm text-gray-400 italic border-t border-gray-100 pt-3">"{clientInfo.notes}"</p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 mb-5 flex items-start gap-2">
                <span className="text-base leading-none">⏳</span>
                <span>This is a booking <strong>request</strong>. {settings.business_name || "The business"} will confirm your appointment shortly. Your slot is held while pending.</span>
              </div>

              <Button onClick={handleSubmit} disabled={submitting}
                className="w-full bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-2xl h-14 font-black text-lg shadow-xl shadow-fuchsia-200 gap-2">
                {submitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Sending...</>
                ) : (
                  "Send Booking Request"
                )}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}