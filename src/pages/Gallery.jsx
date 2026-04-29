import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  Images,
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  ZoomIn,
  Upload,
  Calendar,
} from "lucide-react";
import MobileNav from "@/components/layout/MobileNav";

function UploadModal({ onClose, onAdd }) {
  const fileRef = useRef();
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dragging, setDragging] = useState(false);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = () => {
    if (!preview) return;
    onAdd({
      id: Date.now().toString(),
      url: preview,
      title: title.trim() || "Untitled",
      description: description.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 z-10"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-gray-800">Add New Photo</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all mb-4 overflow-hidden
            ${dragging ? "border-violet-400 bg-violet-50" : "border-violet-200 hover:border-violet-400 hover:bg-violet-50/50"}
            ${preview ? "h-52" : "h-36 flex items-center justify-center"}`}
        >
          {preview ? (
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-violet-400">
              <Upload className="w-8 h-8" />
              <p className="text-sm font-semibold">Click or drag to upload</p>
              <p className="text-xs text-gray-400">PNG, JPG, WEBP supported</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
        </div>

        {/* Fields */}
        <div className="space-y-3 mb-5">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Balayage Highlights"
              className="rounded-xl border-violet-100"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Description (optional)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description..."
              className="rounded-xl border-violet-100"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Cancel</Button>
          <Button
            onClick={handleSubmit}
            disabled={!preview}
            className="bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl px-6 font-bold"
          >
            Add Photo
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Lightbox({ photo, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        onClick={(e) => e.stopPropagation()}
        className="relative z-10 max-w-3xl w-full rounded-3xl overflow-hidden shadow-2xl bg-black"
      >
        <img src={photo.url} alt={photo.title} className="w-full max-h-[70vh] object-contain" />
        <div className="p-4 bg-white/5 text-white">
          <p className="font-bold text-lg">{photo.title}</p>
          {photo.description && <p className="text-sm text-white/70 mt-0.5">{photo.description}</p>}
          {photo.date && (
            <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {photo.date}
            </p>
          )}
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </motion.div>
    </div>
  );
}

function PhotoCard({ photo, onDelete, onEdit }) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(photo.title);
  const [lightbox, setLightbox] = useState(false);

  const handleSave = () => {
    onEdit(photo.id, { title: editTitle.trim() || "Untitled" });
    setEditing(false);
  };

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        className="group relative bg-white/70 backdrop-blur rounded-2xl overflow-hidden shadow-sm border border-white/80 flex flex-col"
      >
        {/* Image */}
        <div
          className="relative overflow-hidden cursor-zoom-in"
          style={{ paddingTop: "75%" }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={photo.url}
            alt={photo.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: hovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/30 flex items-center justify-center"
          >
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Info */}
        <div className="p-3 flex-1 flex flex-col gap-1">
          {editing ? (
            <div className="flex items-center gap-1">
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="h-7 text-xs rounded-lg border-violet-200 px-2"
                autoFocus
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
              />
              <button onClick={handleSave} className="p-1 rounded-lg bg-violet-100 hover:bg-violet-200 transition-colors">
                <Check className="w-3.5 h-3.5 text-violet-600" />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                <X className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
          ) : (
            <p className="text-sm font-bold text-gray-800 truncate">{photo.title}</p>
          )}
          {photo.description && !editing && (
            <p className="text-xs text-gray-400 truncate">{photo.description}</p>
          )}
          {photo.date && !editing && (
            <p className="text-[10px] text-gray-300 flex items-center gap-1 mt-auto">
              <Calendar className="w-3 h-3" /> {photo.date}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: hovered ? 1 : 0 }}
          className="absolute top-2 right-2 flex gap-1"
        >
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-violet-50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-violet-500" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
            className="p-1.5 rounded-lg bg-white/90 shadow hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
          </button>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {lightbox && <Lightbox photo={photo} onClose={() => setLightbox(false)} />}
      </AnimatePresence>
    </>
  );
}

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [showUpload, setShowUpload] = useState(false);

  const handleAdd = (photo) => setPhotos((prev) => [photo, ...prev]);
  const handleDelete = (id) => setPhotos((prev) => prev.filter((p) => p.id !== id));
  const handleEdit = (id, updates) => setPhotos((prev) => prev.map((p) => p.id === id ? { ...p, ...updates } : p));

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50">
      {/* Decorative BG */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl pb-24 lg:pb-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <button className="p-2 rounded-full hover:bg-white/60 transition-colors">
                <ChevronLeft className="w-5 h-5 text-violet-600" />
              </button>
            </Link>
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-5 py-2.5 rounded-2xl">
                <h1 className="text-xl font-black flex items-center gap-2">
                  <Images className="w-5 h-5" /> Photo Gallery
                </h1>
              </div>
            </div>
          </div>
          <Button
            onClick={() => setShowUpload(true)}
            className="bg-gradient-to-r from-fuchsia-500 to-orange-500 hover:from-fuchsia-600 hover:to-orange-600 text-white rounded-full px-5 font-bold shadow-lg gap-2"
          >
            <Plus className="w-4 h-4" /> Add Photo
          </Button>
        </motion.div>

        {/* Empty state */}
        {photos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <div className="w-24 h-24 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <Images className="w-12 h-12 text-violet-300" />
            </div>
            <p className="text-gray-500 font-semibold text-lg mb-1">No photos yet</p>
            <p className="text-gray-400 text-sm mb-6">Showcase your salon's best work</p>
            <Button
              onClick={() => setShowUpload(true)}
              className="bg-gradient-to-r from-fuchsia-500 to-orange-500 text-white rounded-full px-6 font-bold gap-2"
            >
              <Plus className="w-4 h-4" /> Upload First Photo
            </Button>
          </motion.div>
        )}

        {/* Grid */}
        {photos.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
          >
            <AnimatePresence>
              {photos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  photo={photo}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal onClose={() => setShowUpload(false)} onAdd={handleAdd} />
        )}
      </AnimatePresence>
      <MobileNav />
    </div>
  );
}