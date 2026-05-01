import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { User, Session } from '@supabase/supabase-js';

interface ProfileLite {
  id: string;
  full_name: string;
  name: string;
  email: string;
  phone: string;
  avatar_url: string;
  cover_url: string;
  bio: string;
  address: string;
  level: string;
  points: number;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileLite | null;
  isAdmin: boolean;
  loading: boolean;
  unreadCount: number;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<{ error: string | null; linkedOrders?: number }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileLite | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchProfile = useCallback(async (uid: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    if (data) setProfile(data as unknown as ProfileLite);
  }, []);

  const checkAdmin = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', uid)
      .eq('role', 'admin')
      .maybeSingle();
    setIsAdmin(!!data);
  }, []);

  const fetchUnread = useCallback(async (uid: string) => {
    const { count } = await supabase
      .from('customer_chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', uid)
      .eq('sender', 'admin')
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        const uid = session.user.id;
        setTimeout(() => {
          fetchProfile(uid);
          checkAdmin(uid);
          fetchUnread(uid);
        }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setUnreadCount(0);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        checkAdmin(session.user.id);
        fetchUnread(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile, checkAdmin, fetchUnread]);

  // Realtime: profile + unread chat badge
  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`user-presence-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
        () => fetchProfile(user.id))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_chat_messages', filter: `user_id=eq.${user.id}` },
        () => fetchUnread(user.id))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, fetchProfile, fetchUnread]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message || null };
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/account`,
      },
    });
    if (error) return { error: error.message };

    // Auto-link previous guest orders by email/phone
    let linkedOrders = 0;
    const newUid = data.user?.id;
    if (newUid) {
      const phone = (metadata?.phone || '').trim();
      const conditions: string[] = [`customer_email.ilike.${email}`];
      if (phone) conditions.push(`customer_phone.eq.${phone}`);
      const { data: matched } = await supabase
        .from('orders')
        .select('id')
        .is('user_id', null)
        .or(conditions.join(','));
      if (matched && matched.length > 0) {
        // Update user_id for these orders (server-side via update — RLS allows admins or owners; here we rely on the just-signed-in session)
        // The session is set by signUp when email confirmation is disabled.
        const ids = matched.map((o: any) => o.id);
        const { error: linkErr } = await supabase
          .from('orders')
          .update({ user_id: newUid })
          .in('id', ids);
        if (!linkErr) linkedOrders = ids.length;
      }
    }
    return { error: null, linkedOrders };
  };

  const signInWithGoogle = async () => {
    try {
      const result: any = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: `${window.location.origin}/account`,
      });
      if (result?.error) return { error: result.error.message || 'Lỗi đăng nhập Google' };
      return { error: null };
    } catch (e: any) {
      return { error: e.message };
    }
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message || null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setUnreadCount(0);
  };

  return (
    <AuthContext.Provider value={{
      user, session, profile, isAdmin, loading, unreadCount,
      signIn, signUp, signInWithGoogle, resetPassword, signOut, refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
