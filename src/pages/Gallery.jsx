import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { pageMotion, cardMotion, staggerContainer, fadeIn } from "@/lib/motion";
import { Images, Plus, Trash2, ChevronLeft, Upload, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import MobileNav from "@/components/layout/MobileNav";

function Lightbox({ photo, onClose }) {
  return (
    <motion.div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onClick={onClose}
    >
      <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
        <img src={photo.image_url} alt={photo.title} className="w-full max-h-[80vh] object-contain rounded-2xl" />
        <button onClick={onClose} className="absolute top-2 right-2 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white"><X className="w-4 h-4" /></button>
        {photo.title && <p className="text-white text-center mt-3 font-semibold">{photo.title}</p>}
      </div>
    </motion.div>
  );
}

export default function Gallery() {
  const [lightbox, setLightbox] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [ownerId, setOwnerId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then((u) => setOwnerId(u?.id)); }, []);

  const { data: photos = [], isLoading } = useQuery({ queryKey: ["gallery"], queryFn: () => base44.entities.GalleryPhoto.filter({ owner_id: ownerId }), enabled: !!ownerId });
  const deleteMutation = useMutation({ mutationFn: (id) => base44.entities.GalleryPhoto.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["gallery"] }) });

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !ownerId) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.GalleryPhoto.create({ image_url: file_url, title: file.name.replace(/\.[^.]+$/, ""), owner_id: ownerId });
    queryClient.invalidateQueries({ queryKey: ["gallery"] });
    setUploading(false);
    e.target.value = "";
  };

  return (
    <motion.div className="min-h-screen bg-salon-glow pb-24 lg:pb-8" {...pageMotion}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="p-2 rounded-xl hover:bg-white/70 transition-colors"><ChevronLeft className="w-5 h-5 text-gray-400" /></Link>
            <h1 className="text-2xl font-black text-gray-800">Photo Gallery</h1>
          </div>
          <label className="cursor-pointer">
            <Button asChild className="bg-salon-gradient text-white rounded-full px-5 font-bold shadow-salon-soft hover:opacity-90 gap-2" disabled={uploading}>
              <span><Upload className="w-4 h-4" /> {uploading ? "Uploading..." : "Add Photo"}</span>
            </Button>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {isLoading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-[#EEF2FF] border-t-[#6366F1] rounded-full animate-spin mx-auto" /></div>}

        {!isLoading && photos.length === 0 && (
          <motion.div className="text-center py-16" {...fadeIn}>
            <Images className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-lg font-bold text-gray-400 mb-1">No photos yet</p>
            <p className="text-sm text-gray-300">Showcase your salon best work</p>
          </motion.div>
        )}

        <motion.div className="grid grid-cols-2 sm:grid-cols-3 gap-3" variants={staggerContainer} initial="initial" animate="animate">
          <AnimatePresence>
            {photos.map((photo, i) => (
              <motion.div key={photo.id} variants={cardMotion} transition={{ ...cardMotion.transition, delay: i * 0.05 }} className="group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-white/80 aspect-square">
                <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                  <button onClick={() => setLightbox(photo)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><ZoomIn className="w-4 h-4 text-gray-700" /></button>
                  <button onClick={() => deleteMutation.mutate(photo.id)} className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
                {photo.title && <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2"><p className="text-white text-xs font-semibold truncate">{photo.title}</p></div>}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      <AnimatePresence>
        {lightbox && <Lightbox key="lightbox" photo={lightbox} onClose={() => setLightbox(null)} />}
      </AnimatePresence>
      <MobileNav />
    </motion.div>
  );
}
