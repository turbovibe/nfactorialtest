import { Link, useLocation } from 'wouter';
import { supabase } from '../lib/supabase';

const tabs = [
  { href: '/home', label: 'Home' },
  { href: '/game', label: 'Play Echo' },
  { href: '/time-machine', label: 'Time Machine' },
  { href: '/detective', label: 'Mistake Detective' },
];

export function ToolNav() {
  const [location, navigate] = useLocation();

  async function signOut() {
    await supabase.auth.signOut();
    navigate('/auth', { replace: true });
  }

  return (
    <header className="tool-nav">
      <Link className="brand" href="/home">MIRROR MOVE</Link>
      <nav className="tool-tabs" aria-label="Tools">
        {tabs.map((tab) => (
          <Link
            className={location === tab.href ? 'tool-tab tool-tab--active' : 'tool-tab'}
            href={tab.href}
            key={tab.href}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
      <button className="sign-out" type="button" onClick={signOut}>Sign out</button>
    </header>
  );
}
