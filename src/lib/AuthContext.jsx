/**
 * AuthContext.jsx — Phase 2: Supabase Auth
 *
 * Replaces Base44 auth with Supabase Auth.
 * All other pages are unchanged — they still use base44.entities.*
 * Only AuthContext and the Clients page are migrated in this phase.
 *
 * What changed vs Base44 AuthContext:
 *  - base44.auth.me()          → supabase.auth.getUser()
 *  - base44.auth.logout()      → supabase.auth.signOut()
 *  - base44.auth.redirectToLogin() → supabase.auth.signInWithOtp (magic link)
 *  - appPublicSettings (Base44-specific) → removed (not needed)
 *  - isLoadingPublicSettings   → removed (not needed)
 *  - authError types           → simplified to 'auth_required' | 'error'
 *
 * Shape of user object (unchanged for downstream compatibility):
 *   { id: string, email: string, ...supabase user fields }
 */

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/api/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                     = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth]   = useState(true);
  const [authError, setAuthError]           = useState(null);

  // ── Session hydration ────────────────────────────────────────
  // On mount, read existing session from Supabase (cookies/localStorage).
  // Then subscribe to auth state changes (sign-in, sign-out, token refresh).
  useEffect(() => {
    let mounted = true;

    const hydrateSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (!mounted) return;
        if (error) throw error;
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        if (!mounted) return;
        console.error('[AuthContext] getSession failed:', err.message);
        setAuthError({ type: 'error', message: err.message });
      } finally {
        if (mounted) setIsLoadingAuth(false);
      }
    };

    hydrateSession();

    // Real-time auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session?.user) {
          setUser(session.user);
          setIsAuthenticated(true);
          setAuthError(null);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoadingAuth(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ── Auth actions ─────────────────────────────────────────────

  /**
   * Sign out the current user.
   * shouldRedirect kept for API compatibility with callers.
   */
  const logout = useCallback(async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) {
      window.location.href = '/salon-booking-saas/';
    }
  }, []);

  /**
   * Send a magic-link email to the user.
   * Replaces base44.auth.redirectToLogin().
   * @param {string} email
   */
  const sendMagicLink = useCallback(async (email) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/salon-booking-saas/',
      },
    });
    if (error) throw error;
  }, []);

  /**
   * navigateToLogin — kept for API compatibility.
   * Opens the LoginPage inline (handled by AuthenticatedApp gating).
   */
  const navigateToLogin = useCallback(() => {
    setAuthError({ type: 'auth_required', message: 'Please sign in to continue.' });
  }, []);

  /**
   * checkAppState — kept for API compatibility with callers.
   * Equivalent to re-checking the current session.
   */
  const checkAppState = useCallback(async () => {
    setIsLoadingAuth(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setIsAuthenticated(true);
    } else {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError({ type: 'auth_required', message: 'Authentication required' });
    }
    setIsLoadingAuth(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings: false,   // compat: no longer needed
      authError,
      appPublicSettings: null,          // compat: no longer needed
      logout,
      navigateToLogin,
      checkAppState,
      sendMagicLink,                    // new — for LoginPage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
