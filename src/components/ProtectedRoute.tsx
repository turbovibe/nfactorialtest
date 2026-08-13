import { useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [, navigate] = useLocation();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoading && !session) navigate('/login', { replace: true });
  }, [isLoading, navigate, session]);

  if (isLoading || !session) {
    return <main className="auth-loading" aria-live="polite">Checking your account…</main>;
  }

  return children;
}
