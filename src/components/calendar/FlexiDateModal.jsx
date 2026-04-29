import React, { useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, CalendarX, Clock, CalendarCheck, Sparkles, ZapIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const SCHEDULE_TYPES = [
  {
    key: "closed_day",
    label: "Closed Day",
    description: "Block entire day — no appointments",
    icon: CalendarX,
    color: "border-red-400 bg-red-50 text-red-700",
    selectedColor: "border-red-500 bg-red-100 ring-2 ring-red-400",
    iconColor: "text-red-500",
  },
  {
    key: "block_time",
    label: "Block Time",
    description: "Block a specific time range",
    icon: Clock,
    color: "border-amber-400 bg-amber-50 text-amber-700",
    selectedColor: "border-amber-500 bg-amber-100 ring-2 ring-amber-400",
    iconColor: "text-amber-500",
  },
  {
    key: "special_hours",
    label: "Special Hours",
    description: "Change available hours for this day",
    icon: ZapIcon,
    color: "border-violet-400 bg-violet-50 text-violet-700",
    selectedColor: "border-violet-500 bg-violet-100 ring-2 ring-violet-400",
    iconColor: "text-violet-500",
  },
  {
    key: "extra_working_day",
    label: "Extra Working Day",
    description: "Allow appointments on a normally closed day",
    icon: CalendarCheck,
    color: "border-green-400 bg-green-50 text-green-700",
    selectedColor: "border-green-500 bg-green-100 ring-2 ring-green-400",
    iconColor: "text-green-500",
  },
];

const TIME_OPTIONS = [];
for (let h = 6; h <= 22; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
  }
}

export default function FlexiDateModal({ open, onOpenChange, onSave, loading }) {
  const [formData, setFormData] = useState({
    date: null,
    schedule_type: "",
    start_time: "",
    end_time: "",
    notes: "",
  });

  const needsTime = ["block_time", "special_hours"].includes(formData.schedule_type);

  const isValid =
    formData.date &&
    formData.schedule_type &&
    (!needsTime || (formData.start_time && formData.end_time));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isValid) return;
    onSave({
      date: format(formData.date, "yyyy-MM-dd"),
      schedule_type: formData.schedule_type,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      notes: formData.notes,
    });
    setFormData({ date: null, schedule_type: "", start_time: "", end_time: "", notes: "" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            Create Schedule Rule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">

          {/* Date picker */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl border-2 bg-white",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? format(formData.date, "PPP") : "Select a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => setFormData({ ...formData, date })}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Schedule type */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Schedule Type *</Label>
            <div className="grid grid-cols-2 gap-2">
              {SCHEDULE_TYPES.map((type) => {
                const Icon = type.icon;
                const isSelected = formData.schedule_type === type.key;
                return (
                  <motion.button
                    key={type.key}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setFormData({ ...formData, schedule_type: type.key, start_time: "", end_time: "" })}
                    className={cn(
                      "p-3 rounded-xl border-2 flex flex-col items-start gap-1 transition-all text-left",
                      isSelected ? type.selectedColor : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <Icon className={cn("w-4 h-4", isSelected ? type.iconColor : "text-gray-400")} />
                    <span className="font-bold text-xs text-gray-800">{type.label}</span>
                    <span className="text-[10px] text-gray-500 leading-tight">{type.description}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Time range — only for block_time & special_hours */}
          {needsTime && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600">Start Time *</Label>
                <select
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400"
                >
                  <option value="">-- select --</option>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold text-gray-600">End Time *</Label>
                <select
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  className="w-full rounded-xl border-2 border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400"
                >
                  <option value="">-- select --</option>
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </motion.div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">Notes / Reason (Optional)</Label>
            <Textarea
              placeholder="e.g. Staff training, public holiday, renovation..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="rounded-xl border-2 focus:border-violet-400 resize-none"
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading || !isValid}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-xl py-5 font-bold text-base shadow-lg shadow-violet-200"
          >
            {loading ? (
              <span className="flex items-center gap-2"><span className="animate-spin">⏳</span> Saving...</span>
            ) : (
              <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Create Schedule Rule</span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}