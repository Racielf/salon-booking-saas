import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Check, X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PendingRequestsBanner({ appointments = [] }) {
  const queryClient = useQueryClient();

  // Only show portal-originated pending requests, sorted by date+time, max 5
  const pending = [...appointments]
    .filter((a) => a.status === "pending" && a.source === "booking_portal")
    .sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.time || "").localeCompare(b.time || ""))
    .slice(0, 5);

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.Appointment.update(id, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });

  if (pending.length === 0) return null;

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2 px-1">
        <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shrink-0">
          <Bell className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-bold text-amber-700">
          {pending.length} new booking request{pending.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {pending.map((appt) => (
            <motion.div
              key={appt.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className="bg-white/90 backdrop-blur rounded-2xl p-4 border-2 border-amber-200 shadow-sm flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-black shrink-0 text-sm">
                {appt.client_name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{appt.client_name}</p>
                <p className="text-xs text-gray-500 truncate">{appt.service_names?.join(", ")}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {appt.date && format(new Date(appt.date + "T00:00:00"), "MMM d")} at {appt.time}
                </div>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate({ id: appt.id, status: "confirmed" })}
                  disabled={updateMutation.isPending}
                  className="bg-green-500 hover:bg-green-600 text-white rounded-xl h-8 px-3 text-xs font-bold"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateMutation.mutate({ id: appt.id, status: "rejected" })}
                  disabled={updateMutation.isPending}
                  className="border-red-200 hover:bg-red-50 text-red-400 rounded-xl h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}