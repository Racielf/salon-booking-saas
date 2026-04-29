import React from 'react';
import { base44 } from '@/api/base44Client';
import { Scissors, ShieldX, LogOut, Mail, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 flex items-center justify-center p-4">
      {/* Decorative blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white px-6 py-3 rounded-2xl shadow-lg shadow-violet-200 mb-3">
            <Scissors className="w-6 h-6" />
            <span className="text-2xl font-black">YMY Pro</span>
          </div>
          <p className="text-gray-400 text-sm">Salon Management System</p>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl border border-white p-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center mb-4">
              <ShieldX className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-black text-gray-800 mb-2">Access Restricted</h1>
            <p className="text-gray-500 text-sm mb-6">
              Your account is not registered to use this application. Please contact the salon administrator to request access.
            </p>

            <div className="w-full p-4 bg-violet-50 rounded-2xl border border-violet-100 text-left mb-6 space-y-2">
              <p className="text-xs font-bold text-violet-700 mb-2">What you can do:</p>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <Mail className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <span>Verify you're logged in with the correct email address</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <RefreshCw className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <span>Ask the salon owner to invite you to this app</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-gray-600">
                <LogOut className="w-3.5 h-3.5 text-violet-400 mt-0.5 shrink-0" />
                <span>Try logging out and signing in with a different account</span>
              </div>
            </div>

            <Button
              onClick={() => base44.auth.logout()}
              className="w-full bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white rounded-xl font-bold gap-2"
            >
              <LogOut className="w-4 h-4" /> Sign Out & Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;