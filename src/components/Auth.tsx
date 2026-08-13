import { useState, type FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

type AuthProps = {
  onSignIn: () => void;
};

export function Auth({ onSignIn }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      const request = mode === 'signup'
        ? supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin },
          })
        : supabase.auth.signInWithPassword({ email, password });
      const { data, error } = await request;

      if (error) setMessage(error.message);
      else if (mode === 'signup' && data.session) onSignIn();
      else if (mode === 'signup') setMessage('Account created! Check your email, then come back to sign in.');
      else onSignIn();
    } catch {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleSignIn() {
    setBusy(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });

      if (error) setMessage(error.message);
    } catch {
      setMessage('Could not connect to Google. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setMessage('');
  }

  return (
    <section className="auth-card">
      <p className="eyebrow">Your next game starts here</p>
      <h1>{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h1>
      <p className="auth-card__intro">
        {mode === 'signin'
          ? 'Sign in to continue playing against Echo.'
          : 'Save your games and watch Echo learn how you play.'}
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          required
        />
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          placeholder="At least 6 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          minLength={6}
          required
        />
        <button className="glow-button" data-glow type="submit" disabled={busy}>
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      {message && <p className="auth-message" role="status" aria-live="polite">{message}</p>}
      <button className="auth-switch" type="button" onClick={switchMode}>
        {mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}
      </button>

      <div className="auth-divider"><span>or</span></div>
      <button
        className="google-sign-in glow-button"
        data-glow
        type="button"
        onClick={handleGoogleSignIn}
        disabled={busy}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path fill="#4285f4" d="M21.6 12.2c0-.7-.1-1.5-.2-2.2H12v4.3h5.4a4.6 4.6 0 0 1-2 3v2.8h3.5c2-1.9 3.2-4.6 3.2-7.9Z" />
          <path fill="#34a853" d="M12 22c2.9 0 5.3-1 7-2.6l-3.5-2.8c-1 .7-2.2 1-3.5 1a6.1 6.1 0 0 1-5.7-4.2H2.7v2.9A10.5 10.5 0 0 0 12 22Z" />
          <path fill="#fbbc05" d="M6.3 13.4A6.3 6.3 0 0 1 6 11.6c0-.6.1-1.2.3-1.8v-3H2.7a10.5 10.5 0 0 0 0 9.5l3.6-2.9Z" />
          <path fill="#ea4335" d="M12 5.5c1.6 0 3 .6 4.1 1.6l3-3A10 10 0 0 0 2.6 6.8l3.6 3A6.1 6.1 0 0 1 12 5.5Z" />
        </svg>
        Continue with Google
      </button>
    </section>
  );
}
