import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Pencil, Trash2, Search, Check, ToggleLeft, ToggleRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Starter services definition ──────────────────────────────────────────────
function buildStarterItems(ownerId) {
  const today = new Date().toISOString().split("T")[0];
  return [
    { owner_id: ownerId, category: "Uñas",    name: "Pedicura",                     price_type: "fixed", price: 45,  description: "Pedicure service.",                                                           is_active: true, sort_order: 1,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Uñas",    name: "Acrílico",                     price_type: "range", min_price: 60, max_price: 75, description: "Acrylic nail service. Final price depends on length/design.",               is_active: true, sort_order: 2,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Uñas",    name: "Gel X",                        price_type: "range", min_price: 60, max_price: 75, description: "Gel X nail extensions. Final price depends on style/design.",              is_active: true, sort_order: 3,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Uñas",    name: "Builder Gel",                  price_type: "range", min_price: 60, max_price: 65, description: "Builder gel overlay or structure service.",                                 is_active: true, sort_order: 4,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Uñas",    name: "Sistema Dual",                 price_type: "fixed", price: 75,  description: "Dual system nail service.",                                                    is_active: true, sort_order: 5,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Cabello", name: "Corte de cabello",             price_type: "fixed", price: 35,  description: "Haircut service.",                                                             is_active: true, sort_order: 6,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Cabello", name: "Alisados orgánicos",           price_type: "range", min_price: 150, max_price: 350, description: "Organic smoothing treatment. Final price depends on hair length and density.", is_active: true, sort_order: 7,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Cabello", name: "Tintes",                       price_type: "fixed", price: 75,  description: "Hair color service. Price may vary by length or extra product.",               is_active: true, sort_order: 8,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Cabello", name: "Rayos o iluminaciones",        price_type: "fixed", price: 175, description: "Highlights or dimensional lighting service.",                                  is_active: true, sort_order: 9,  created_date: today, updated_date: today },
    { owner_id: ownerId, category: "Cejas",   name: "Depilación de cejas con cera", price_type: "fixed", price: 0,   description: "Eyebrow waxing service. ⚠️ Update price before using.",                        is_active: true, sort_order: 10, created_date: today, updated_date: today },
  ];
}

// ── Price display helper ──────────────────────────────────────────────────────
function priceDisplay(item) {
  if (item.price_type === "range") return `$${item.min_price ?? 0}–$${item.max_price ?? 0}`;
  return `$${item.price ?? 0}`;
}

// ── Inline item form ──────────────────────────────────────────────────────────
function ItemForm({ item, ownerId, onCancel, onSaved }) {
  const today = new Date().toISOString().split("T")[0];
  const [name, setName]           = useState(item?.name || "");
  const [category, setCategory]   = useState(item?.category || "");
  const [description, setDesc]    = useState(item?.description || "");
  const [priceType, setPriceType] = useState(item?.price_type || "fixed");
  const [price, setPrice]         = useState(item?.price ?? "");
  const [minPrice, setMin]        = useState(item?.min_price ?? "");
  const [maxPrice, setMax]        = useState(item?.max_price ?? "");
  const [sortOrder, setSort]      = useState(item?.sort_order ?? "");
  const [isActive, setActive]     = useState(item?.is_active ?? true);
  const [saving, setSaving]       = useState(false);

  const handleSave = async () => {
    if (!ownerId || !name.trim()) return;
    setSaving(true);
    const payload = {
      owner_id: ownerId,
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      price_type: priceType,
      price: priceType === "fixed" ? (parseFloat(price) || 0) : null,
      min_price: priceType === "range" ? (parseFloat(minPrice) || 0) : null,
      max_price: priceType === "range" ? (parseFloat(maxPrice) || 0) : null,
      is_active: isActive,
      sort_order: parseInt(sortOrder) || null,
      updated_date: today,
      ...(item ? {} : { created_date: today }),
    };
    try {
      if (item?.id) {
        await base44.entities.PriceBookItem.update(item.id, payload);
      } else {
        await base44.entities.PriceBookItem.create(payload);
      }
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-violet-50/80 rounded-xl p-4 border border-violet-100 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Name *</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Pedicura" className="rounded-xl border-violet-200 bg-white h-9" />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Category</label>
          <Input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Uñas, Cabello, Cejas" className="rounded-xl border-violet-200 bg-white h-9" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
        <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2} placeholder="Service description..."
          className="w-full border-2 border-violet-100 rounded-xl px-3 py-1.5 text-sm bg-white focus:outline-none focus:border-violet-400 resize-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Price Type</label>
          <select value={priceType} onChange={e => setPriceType(e.target.value)}
            className="w-full border-2 border-violet-100 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:border-violet-400">
            <option value="fixed">Fixed Price</option>
            <option value="range">Price Range</option>
          </select>
        </div>
        {priceType === "fixed" ? (
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Price ($)</label>
            <Input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0.00" min={0} className="rounded-xl border-violet-200 bg-white h-9" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Min ($)</label>
              <Input type="number" value={minPrice} onChange={e => setMin(e.target.value)} placeholder="0" min={0} className="rounded-xl border-violet-200 bg-white h-9" />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Max ($)</label>
              <Input type="number" value={maxPrice} onChange={e => setMax(e.target.value)} placeholder="0" min={0} className="rounded-xl border-violet-200 bg-white h-9" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-600 font-semibold select-none">
          <button type="button" onClick={() => setActive(v => !v)} className="focus:outline-none">
            {isActive ? <ToggleRight className="w-6 h-6 text-violet-500" /> : <ToggleLeft className="w-6 h-6 text-gray-300" />}
          </button>
          {isActive ? "Active" : "Inactive"}
        </label>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel} className="rounded-xl h-8 px-4 text-xs">Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !name.trim() || !ownerId}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-xl h-8 px-4 text-xs font-bold gap-1">
            <Check className="w-3 h-3" />{saving ? "Saving…" : item ? "Update" : "Add"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function PriceBookSection({ ownerId }) {
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [loadingStarter, setLoadingStarter] = useState(false);
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["pricebook", ownerId],
    queryFn: () => base44.entities.PriceBookItem.filter({ owner_id: ownerId }),
    enabled: !!ownerId,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.PriceBookItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricebook", ownerId] }),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PriceBookItem.update(id, { is_active, updated_date: new Date().toISOString().split("T")[0] }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["pricebook", ownerId] }),
  });

  const handleDone = () => {
    setShowForm(false);
    setEditing(null);
    queryClient.invalidateQueries({ queryKey: ["pricebook", ownerId] });
  };

  const handleEdit = (item) => { setEditing(item); setShowForm(true); };
  const handleNew  = () => { setEditing(null); setShowForm(true); };

  const handleLoadStarter = async () => {
    if (!ownerId) return;
    setLoadingStarter(true);
    try {
      const starters = buildStarterItems(ownerId);
      await Promise.all(starters.map(s => base44.entities.PriceBookItem.create(s)));
      queryClient.invalidateQueries({ queryKey: ["pricebook", ownerId] });
    } finally {
      setLoadingStarter(false);
    }
  };

  // Filtered + grouped by category
  const filtered = items.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase()) ||
    i.category?.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce((acc, item) => {
    const cat = item.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const sortedCategories = Object.keys(grouped).sort();

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-7 h-7 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search services..."
            className="pl-8 rounded-2xl border-2 border-violet-100 focus:border-violet-400 bg-white/80 h-9 text-sm" />
        </div>
        <Button onClick={handleNew}
          className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-4 font-bold gap-2 h-9 text-sm shrink-0">
          <Plus className="w-3.5 h-3.5" /> Add Service
        </Button>
      </div>

      {/* Inline form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <ItemForm
              item={editing}
              ownerId={ownerId}
              onCancel={() => { setShowForm(false); setEditing(null); }}
              onSaved={handleDone}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {!isLoading && items.length === 0 && !showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-8 h-8 text-violet-300" />
          </div>
          <p className="text-gray-500 font-semibold mb-1">No price book services yet</p>
          <p className="text-gray-400 text-sm mb-5">Add your services manually or load the starter salon price book.</p>
          <Button onClick={handleLoadStarter} disabled={loadingStarter || !ownerId}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-full px-6 font-bold gap-2">
            <BookOpen className="w-4 h-4" />
            {loadingStarter ? "Loading…" : "Load starter salon price book"}
          </Button>
        </motion.div>
      )}

      {/* Starter load button (when items exist but user may want more) */}
      {!isLoading && items.length > 0 && items.length < 5 && (
        <div className="flex items-center gap-2 text-xs text-violet-500 bg-violet-50 rounded-xl px-3 py-2">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>You can still load the</span>
          <button onClick={handleLoadStarter} disabled={loadingStarter || !ownerId}
            className="underline font-bold hover:text-violet-700 disabled:opacity-50">
            {loadingStarter ? "loading…" : "starter salon price book"}
          </button>
        </div>
      )}

      {/* No search results */}
      {items.length > 0 && filtered.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm font-medium">No services match your search</p>
        </div>
      )}

      {/* Items grouped by category */}
      {sortedCategories.map(cat => (
        <div key={cat}>
          <h3 className="text-xs font-black text-violet-500 uppercase tracking-widest mb-2 px-1">{cat}</h3>
          <div className="space-y-2">
            <AnimatePresence>
              {grouped[cat]
                .sort((a, b) => (a.sort_order ?? 99) - (b.sort_order ?? 99))
                .map((item, i) => (
                <motion.div key={item.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.02 }}
                  className={`flex items-start gap-3 rounded-xl px-3 py-2.5 border transition-all ${
                    item.is_active
                      ? "bg-white/80 border-violet-100"
                      : "bg-gray-50/80 border-gray-100 opacity-60"
                  }`}>
                  {/* Active toggle */}
                  <button onClick={() => toggleActive.mutate({ id: item.id, is_active: !item.is_active })}
                    className="mt-0.5 shrink-0 focus:outline-none" title={item.is_active ? "Deactivate" : "Activate"}>
                    {item.is_active
                      ? <ToggleRight className="w-5 h-5 text-violet-400" />
                      : <ToggleLeft className="w-5 h-5 text-gray-300" />}
                  </button>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="font-bold text-sm text-gray-800">{item.name}</span>
                      <span className={`font-mono text-xs font-black ${
                        item.price === 0 && item.price_type === "fixed" ? "text-amber-500" : "text-violet-600"
                      }`}>
                        {priceDisplay(item)}
                        {item.price === 0 && item.price_type === "fixed" && (
                          <span className="ml-1 text-[10px] text-amber-500 font-semibold">⚠️ needs price</span>
                        )}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-[11px] text-gray-400 mt-0.5 truncate">{item.description}</p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => handleEdit(item)} className="p-1.5 rounded-lg hover:bg-violet-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5 text-violet-400" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-red-300" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}
    </div>
  );
}
