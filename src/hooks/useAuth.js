// useAuth.js — autenticación con Supabase
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function useAuth() {
  const [user, setUser]       = useState(null);
  const [config, setConfig]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sesión activa al cargar
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConfig(session.user.id);
      else setLoading(false);
    });

    // Escuchar cambios de sesión
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchConfig(session.user.id);
      else { setConfig(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchConfig(userId) {
    const { data } = await supabase
      .from('config')
      .select('*')
      .eq('user_id', userId)
      .single();
    setConfig(data);
    setLoading(false);
  }

  async function login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function updateDiaCorte(dia) {
    const { error } = await supabase
      .from('config')
      .update({ dia_corte: dia })
      .eq('user_id', user.id);
    if (!error) setConfig(c => ({ ...c, dia_corte: dia }));
  }

  return { user, config, loading, login, logout, updateDiaCorte };
}
