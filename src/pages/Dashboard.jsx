import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addMonths, subMonths } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import CalendarHeader from "@/components/calendar/CalendarHeader";
import CalendarGrid from "@/components/calendar/CalendarGrid";
import FlexiDateModal from "@/components/calendar/FlexiDateModal";
import AppointmentPortal from "@/components/salon/AppointmentPortal";
import SalonControlCenter from "@/components/salon/SalonControlCenter";
import ScheduleRuleList from "@/components/calendar/ScheduleRuleList";
import MobileNav from "@/components/layout/MobileNav";
import MobileControlPanel from "@/components/layout/MobileControlPanel";
import PendingRequestsBanner from "@/components/salon/PendingRequestsBanner";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [portalOpen, setPortalOpen] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => setOwnerId(u?.id));
  }, []);

  const { data: flexiDates = [] } = useQuery({
    queryKey: ["flexiDates"],
    queryFn: () => base44.entities.FlexiDate.list(),
    enabled: !!ownerId,
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => base44.entities.Appointment.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: () => base44.entities.Service.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.FlexiDate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flexiDates"] });
      setShowModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.FlexiDate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flexiDates"] });
    },
  });

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => setCurrentDate(new Date());

  const handleDayClick = (date) => {
    setSelectedDay(date);
    setPortalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-gradient-to-br from-teal-300/30 to-cyan-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-orange-300/30 to-amber-300/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-3 sm:px-4 py-4 sm:py-6 lg:py-8 pb-24 lg:pb-8">
        <CalendarHeader
          currentDate={currentDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />

        <PendingRequestsBanner appointments={appointments} />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex justify-end gap-2 sm:gap-3 mb-4"
        >
          <Button
            onClick={() => { setSelectedDay(new Date()); setPortalOpen(true); }}
            variant="outline"
            className="border-2 border-violet-200 hover:border-violet-400 hover:bg-violet-50 rounded-full px-3 sm:px-5 font-bold flex items-center gap-1.5 text-sm h-10"
          >
            <Plus className="w-4 h-4 text-violet-600" />
            <span className="hidden sm:inline">New </span>Appointment
          </Button>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-3 sm:px-6 font-bold shadow-lg shadow-fuchsia-200 flex items-center gap-1.5 text-sm h-10"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Block / Special Day</span>
            <span className="sm:hidden">Block Day</span>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="lg:col-span-3">
            <CalendarGrid
              currentDate={currentDate}
              flexiDates={flexiDates}
              appointments={appointments}
              onDayClick={handleDayClick}
            />
          </div>

          <div className="hidden lg:block space-y-4">
            <SalonControlCenter
              appointments={appointments}
              clients={clients}
              services={services}
            />
            <ScheduleRuleList
              scheduleRules={flexiDates}
              onDelete={(id) => deleteMutation.mutate(id)}
              loading={deleteMutation.isPending}
            />
          </div>
        </div>

        <FlexiDateModal
          open={showModal}
          onOpenChange={setShowModal}
          onSave={(data) => createMutation.mutate(data)}
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
      </div>

      <MobileNav />

      <MobileControlPanel
        appointments={appointments}
        clients={clients}
        services={services}
        scheduleRules={flexiDates}
        onDeleteRule={(id) => deleteMutation.mutate(id)}
        deletingRule={deleteMutation.isPending}
      />
    </div>
  );
}