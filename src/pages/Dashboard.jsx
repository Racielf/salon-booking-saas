import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addMonths, subMonths } from "date-fns";
import { Plus, CalendarOff } from "lucide-react";
import { motion } from "framer-motion";
import { pageMotion } from "@/lib/motion";

import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import FlexiDateModal from "@/components/calendar/FlexiDateModal";
import AppointmentPortal from "@/components/salon/AppointmentPortal";
import MobileNav from "@/components/layout/MobileNav";
import MobileControlPanel from "@/components/layout/MobileControlPanel";
import SalonControlCenter from "@/components/salon/SalonControlCenter";
import ScheduleRuleList from "@/components/calendar/ScheduleRuleList";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal]     = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [portalOpen, setPortalOpen]   = useState(false);
  const [ownerId, setOwnerId]         = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: flexiDates = [] } = useQuery({
    queryKey: ["flexiDates", ownerId],
    queryFn:  () => base44.entities.FlexiDate.filter({ owner_id: ownerId }),
    enabled:  !!ownerId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn:  () => base44.entities.Appointment.filter({ owner_id: ownerId }),
    enabled:  !!ownerId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn:  () => base44.entities.Client.filter({ owner_id: ownerId }),
    enabled:  !!ownerId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn:  () => base44.entities.Service.filter({ owner_id: ownerId }),
    enabled:  !!ownerId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FlexiDate.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["flexiDates"] }); setShowModal(false); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FlexiDate.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flexiDates"] }),
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday     = () => setCurrentDate(new Date());
  const handleDayClick  = (date) => { setSelectedDay(date); setPortalOpen(true); };

  return (
    <motion.div className="min-h-screen bg-salon-glow pb-24 lg:pb-6" {...pageMotion}>
      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-5">
        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <motion.button
            onClick={() => { setSelectedDay(new Date()); setPortalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-violet-300 hover:text-violet-600 shadow-sm transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <Plus className="w-4 h-4" /> New Appointment
          </motion.button>
          <motion.button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-salon-gradient text-white text-sm font-bold shadow-salon-soft hover:opacity-90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CalendarOff className="w-4 h-4" /> Block / Special Day
          </motion.button>
        </div>

        {/* Main layout */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-start">
          <div className="flex-1 min-w-0">
            <CalendarGrid
              currentDate={currentDate}
              flexiDates={flexiDates}
              appointments={appointments}
              onDayClick={handleDayClick}
            />
          </div>

          {/* Desktop sidebar */}
          <div className="hidden lg:block w-72 xl:w-80 shrink-0 space-y-4">
            <SalonControlCenter appointments={appointments} clients={clients} services={services} />
            <ScheduleRuleList
              scheduleRules={flexiDates}
              onDelete={(id) => deleteMutation.mutate(id)}
              loading={deleteMutation.isPending}
            />
          </div>

          {/* Mobile control panel trigger */}
          <div className="lg:hidden w-full">
            <MobileControlPanel
              appointments={appointments}
              clients={clients}
              services={services}
              scheduleRules={flexiDates}
              onDeleteRule={(id) => deleteMutation.mutate(id)}
              deletingRule={deleteMutation.isPending}
            />
          </div>
        </div>
      </div>

      <FlexiDateModal
        open={showModal}
        onOpenChange={setShowModal}
        onSave={(data) => createMutation.mutate({ ...data, owner_id: ownerId })}
        loading={createMutation.isPending}
      />

      <AppointmentPortal
        open={portalOpen}
        onOpenChange={(v) => { setPortalOpen(v); if (!v) setSelectedDay(null); }}
        initialDate={selectedDay}
        appointments={appointments}
        services={services}
        clients={clients}
        flexiDates={flexiDates}
        onSaved={() => queryClient.invalidateQueries({ queryKey: ["appointments"] })}
        onClientCreated={() => queryClient.invalidateQueries({ queryKey: ["clients"] })}
      />

      <MobileNav />
    </motion.div>
  );
}
