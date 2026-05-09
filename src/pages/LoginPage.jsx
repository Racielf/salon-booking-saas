/**
 * LoginPage.jsx
 *
 * Supabase magic-link login screen for salon-booking-saas.
 * Shown when the user is not authenticated (no active Supabase session).
 *
 * Flow:
 *  1. User enters their email.
 *  2. We call supabase.auth.signInWithOtp({ email }).
 *  3. Supabase sends a magic link to the email.
 *  4. User clicks the link → Supabase redirects back to the app.
 *  5. AuthContext.onAuthStateChange fires → user is set → app loads.
 */

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LoginPage() {
  const { sendMagicLink } = useAuth();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError('');
    try {
      await sendMagicLink(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Failed to send login email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-fuchsia-50 to-orange-50 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-violet-300/30 to-fuchsia-300/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-orange-300/20 to-amber-300/20 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-8">
          {/* Logo / brand */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 rounded-2xl blur-lg opacity-40" />
              <div className="relative bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-white p-3 rounded-2xl">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>
          </div>

          <h1 className="text-2xl font-black text-center text-gray-800 mb-1">SalonFlow</h1>
          <p className="text-center text-gray-500 text-sm mb-8">Sign in to manage your salon</p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">
                  Your email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="pl-9 rounded-xl border-2 border-violet-100 focus:border-violet-400"
                  />
                </div>
              </div>

              {error && (
                <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-xl">{error}</p>
              )}

              <Button
                id="login-submit"
                type="submit"
                disabled={loading || !email.trim()}
                className="w-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-500 hover:from-violet-700 hover:to-orange-600 text-white rounded-xl font-bold h-11 gap-2"
              >
                {loading ? 'Sending...' : 'Send magic link'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </Button>

              <p className="text-center text-xs text-gray-400 mt-4">
                We'll email you a secure sign-in link. No password needed.
              </p>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-3"
            >
              <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
              <h2 className="text-lg font-bold text-gray-800">Check your email!</h2>
              <p className="text-sm text-gray-500">
                We sent a magic link to <strong>{email}</strong>.<br />
                Click the link in the email to sign in.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="text-xs text-violet-500 hover:underline mt-2"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
