import { useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Auth } from '../components/Auth';
import { supabase } from '../lib/supabase';

export function AuthPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate('/home', { replace: true });
    });
  }, [navigate]);

  return (
    <main className="auth-page">
      <nav className="topbar auth-page__nav">
        <Link className="brand" href="/">MIRROR MOVE</Link>
        <Link className="back-link" href="/">← Back home</Link>
      </nav>

      <div className="auth-page__content">
        <Auth onSignIn={() => navigate('/home')} />
        <aside className="auth-page__note" aria-hidden="true">
          <span className="auth-page__knight">♞</span>
          <p>Every move tells Echo a little more about you.</p>
        </aside>
      </div>
    </main>
  );
}
