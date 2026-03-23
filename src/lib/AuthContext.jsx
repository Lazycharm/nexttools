import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const hydrateUser = async (authUser) => {
    if (!authUser) return null;

    const profilePayload = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name ?? '',
    };

    const { error: upsertError } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'id' });
    if (upsertError) {
      // Do not block session usage if profile write fails (RLS/migration timing).
      console.error('Profile upsert failed:', upsertError.message);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
    if (profileError) {
      console.error('Profile fetch failed:', profileError.message);
    }

    return {
      id: authUser.id,
      email: authUser.email,
      full_name: profile?.full_name ?? authUser.user_metadata?.full_name ?? '',
      role: profile?.role ?? 'user',
      wallet_balance: profile?.wallet_balance ?? 0,
      total_deposits: profile?.total_deposits ?? 0,
      created_at: profile?.created_at ?? authUser.created_at,
    };
  };

  useEffect(() => {
    let isMounted = true;
    let profileLoadId = 0;
    let refreshIntervalId;

    const syncFromSession = async (session) => {
      try {
        const authUser = session?.user ?? null;
        if (!isMounted) return;
        if (!authUser) {
          setUser(null);
          return;
        }

        // Immediately expose authenticated user to avoid UI deadlocks.
        setUser((prev) => ({
          id: authUser.id,
          email: authUser.email,
          full_name: prev?.full_name ?? authUser.user_metadata?.full_name ?? '',
          role: prev?.role ?? 'user',
          wallet_balance: prev?.wallet_balance ?? 0,
          total_deposits: prev?.total_deposits ?? 0,
          created_at: prev?.created_at ?? authUser.created_at,
        }));

        const currentLoadId = ++profileLoadId;
        const hydratedUser = await hydrateUser(authUser);
        if (isMounted && currentLoadId === profileLoadId) setUser(hydratedUser);
      } catch (error) {
        console.error('Auth sync failed:', error);
      }
    };

    const bootstrap = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error('getSession failed:', error.message);
        await syncFromSession(data?.session ?? null);
      } catch (error) {
        console.error('Auth bootstrap failed:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    bootstrap();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Supabase recommends deferring async work to avoid lock contention in callback.
      setTimeout(() => {
        syncFromSession(session).finally(() => {
          if (isMounted) setIsLoading(false);
        });
      }, 0);
    });

    const refreshProfile = async () => {
      if (!isMounted) return;
      const { data } = await supabase.auth.getSession();
      const authUser = data?.session?.user ?? null;
      if (!authUser) return;
      await syncFromSession(data.session);
    };

    // Keep wallet/role changes synced when admin updates profile server-side.
    refreshIntervalId = setInterval(refreshProfile, 15000);
    window.addEventListener('focus', refreshProfile);

    return () => {
      isMounted = false;
      if (refreshIntervalId) clearInterval(refreshIntervalId);
      window.removeEventListener('focus', refreshProfile);
      subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }) => supabase.auth.signInWithPassword({ email, password });

  const signUp = async ({ email, password, fullName }) =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName ?? '' },
      },
    });

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      signUp,
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
