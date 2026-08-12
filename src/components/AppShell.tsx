import type { ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { Brand } from './Brand';
import { isDemoMode } from '../lib/demo';

const links = [
  { href: '/dashboard', label: 'Overview', icon: '⌂' },
  { href: '/conversations', label: 'Conversations', icon: '◌' },
  { href: '/knowledge', label: 'Knowledge', icon: '◇' },
  { href: '/actions', label: 'Actions', icon: '↗' },
  { href: '/settings', label: 'Settings', icon: '⚙' },
];

export function AppShell({ children, organizationName }: { children: ReactNode; organizationName: string }) {
  const [location] = useLocation();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />
        <div className="workspace-chip"><span>{organizationName.charAt(0).toUpperCase()}</span><div><small>Workspace</small><strong>{organizationName}</strong></div></div>
        <nav>
          {links.map((link) => <Link key={link.href} className={location === link.href ? 'active' : ''} href={link.href}><span>{link.icon}</span>{link.label}</Link>)}
        </nav>
        {isDemoMode ? <div className="demo-badge">Demo mode</div> : <button className="sign-out" onClick={() => void supabase.auth.signOut()}>Sign out</button>}
      </aside>
      <main className="dashboard-main">{children}</main>
    </div>
  );
}
