import React from 'react';
import { Scissors } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 flex items-center justify-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-8 py-4 rounded-3xl shadow-2xl shadow-violet-200 flex items-center gap-3"
        >
          <Scissors className="w-7 h-7" />
          <span className="text-3xl font-black">YMY Pro</span>
        </motion.div>
        <div className="flex items-center gap-2 text-violet-500">
          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
          <div className="w-2 h-2 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "150ms" }} />
          <div className="w-2 h-2 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="text-sm text-gray-400 font-medium">Loading your salon dashboard...</p>
      </div>
    </div>
  );
}