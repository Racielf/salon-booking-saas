import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ClientForm({ client, ownerId, onCancel, onSaved }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: client?.name || "",
    phone: client?.phone || "",
    email: client?.email || "",
    notes: client?.notes || "",
  });

  const saveMutation = useMutation({
    mutationFn: (data) =>
      client ? base44.entities.Client.update(client.id, data) : base44.entities.Client.create(data),
    onSuccess: (saved) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
      onSaved(saved);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form };
    if (!client && ownerId) payload.owner_id = ownerId;
    saveMutation.mutate(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-sm border border-white">
      <h3 className="font-bold text-gray-800 mb-4">{client ? "Edit Client" : "New Client"}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required className="rounded-xl border-violet-100" placeholder="Full name" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone *</label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required className="rounded-xl border-violet-100" placeholder="+1 555 000 0000" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Email</label>
          <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" className="rounded-xl border-violet-100" placeholder="email@example.com" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Notes</label>
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="rounded-xl border-violet-100" placeholder="Any notes..." />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel} className="rounded-xl">Cancel</Button>
        <Button type="submit" disabled={saveMutation.isPending} className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-xl">
          {saveMutation.isPending ? "Saving..." : client ? "Update Client" : "Save Client"}
        </Button>
      </div>
    </form>
  );
}