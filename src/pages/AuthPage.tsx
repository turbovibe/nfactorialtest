import { Redirect } from 'wouter';
import { AuthForm } from '../components/AuthForm';
import { Brand } from '../components/Brand';
import { SupabaseSetupMessage } from '../components/SupabaseSetupMessage';
import { useAuth } from '../hooks/useAuth';
import { isSupabaseConfigured } from '../lib/supabase';
import { isDemoMode } from '../lib/demo';

export function AuthPage() {
  const { loading, session } = useAuth();

  if (isDemoMode) return <Redirect to="/dashboard" />;

  if (loading) return <main className="centered-page">Loading…</main>;
  if (session) return <Redirect to="/dashboard" />;

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div><p className="eyebrow">Phase one starts here</p><h1>Meet the teammate that never misses a customer.</h1><p>Set up your workspace now. Next, we’ll teach it your business and place it on your website.</p></div>
      </section>
      <section className="auth-panel">
        <div><h2>Welcome to Operator</h2><p>Create an account to set up your AI employee.</p></div>
        {isSupabaseConfigured ? <AuthForm /> : <SupabaseSetupMessage />}
      </section>
    </main>
  );
}
