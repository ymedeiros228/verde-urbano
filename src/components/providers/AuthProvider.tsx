'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/client';

export type Role = 'cidadao' | 'ong' | 'prefeitura';

/** Perfil do cadastro — assina os pontos marcados no mapa */
export interface Perfil {
  nome: string;
  bairro?: string;
}

interface AuthContextValue {
  user: User | null;
  role: Role | null;
  perfil: Perfil | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    role?: Role,
    perfil?: Perfil
  ) => Promise<{ error?: string }>;
  updatePerfil: (perfil: Perfil) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: (role: Role) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_KEY = 'vu_demo_role';
const WARM_AUTH_KEY = 'vu_warm_auth_v1';
const PERFIL_KEY = 'vu_perfil_v1';

function readPerfilLocal(): Perfil | null {
  try {
    const raw = localStorage.getItem(PERFIL_KEY);
    return raw ? (JSON.parse(raw) as Perfil) : null;
  } catch {
    return null;
  }
}

function perfilFromUser(u: User | null | undefined): Perfil | null {
  const m = u?.user_metadata;
  if (!u) return null;
  return { nome: (m?.nome as string) || u.email?.split('@')[0] || 'Cidadão', bairro: m?.bairro as string | undefined };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demo = localStorage.getItem(DEMO_KEY) as Role | null;
    if (!isSupabaseConfigured()) setPerfil(readPerfilLocal());
    if (demo) {
      setRole(demo);
      setUser({
        id: 'demo',
        email: `demo.${demo}@verdeurbano.local`,
      } as User);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      // Primeira visita: entra como cidadão demo (sem “começar do zero”)
      if (!localStorage.getItem(WARM_AUTH_KEY)) {
        localStorage.setItem(DEMO_KEY, 'cidadao');
        localStorage.setItem(WARM_AUTH_KEY, '1');
        setRole('cidadao');
        setUser({
          id: 'demo',
          email: 'demo.cidadao@verdeurbano.local',
        } as User);
      }
      setLoading(false);
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setPerfil(perfilFromUser(data.session?.user));
      const r = data.session?.user?.user_metadata?.role as Role | undefined;
      setRole(r || (data.session ? 'cidadao' : null));
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setPerfil(perfilFromUser(session?.user));
      const r = session?.user?.user_metadata?.role as Role | undefined;
      setRole(r || (session ? 'cidadao' : null));
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured()) {
      return { error: 'Configure o Supabase no .env.local ou use login demo.' };
    }
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message };
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, role: Role = 'cidadao', novo?: Perfil) => {
      if (!isSupabaseConfigured()) {
        // Modo demo: o cadastro vive neste aparelho
        const p = novo ?? { nome: email.split('@')[0] };
        localStorage.setItem(PERFIL_KEY, JSON.stringify(p));
        localStorage.setItem(DEMO_KEY, role);
        localStorage.setItem(WARM_AUTH_KEY, '1');
        setPerfil(p);
        setRole(role);
        setUser({ id: 'demo', email } as User);
        return {};
      }
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, nome: novo?.nome, bairro: novo?.bairro } },
      });
      return { error: error?.message };
    },
    []
  );

  const updatePerfil = useCallback(async (p: Perfil) => {
    setPerfil(p);
    if (!isSupabaseConfigured()) {
      localStorage.setItem(PERFIL_KEY, JSON.stringify(p));
      return;
    }
    const supabase = createClient();
    await supabase.auth.updateUser({ data: { nome: p.nome, bairro: p.bairro } });
  }, []);

  const signOut = useCallback(async () => {
    localStorage.removeItem(DEMO_KEY);
    localStorage.setItem(WARM_AUTH_KEY, '1');
    setUser(null);
    setRole(null);
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
  }, []);

  const demoLogin = useCallback((r: Role) => {
    localStorage.setItem(DEMO_KEY, r);
    localStorage.setItem(WARM_AUTH_KEY, '1');
    setRole(r);
    setUser({
      id: 'demo',
      email: `demo.${r}@verdeurbano.local`,
    } as User);
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      perfil,
      loading,
      signIn,
      signUp,
      updatePerfil,
      signOut,
      demoLogin,
    }),
    [user, role, perfil, loading, signIn, signUp, updatePerfil, signOut, demoLogin]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
