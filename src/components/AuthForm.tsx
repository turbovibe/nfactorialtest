import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabase';

type AuthMode = 'signin' | 'signup';

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');

    const result = mode === 'signup'
      ? await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/dashboard` },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
    } else if (mode === 'signup' && !result.data.session) {
      setMessage('Check your email to confirm your account.');
    }
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        <button className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')} type="button">Create account</button>
        <button className={mode === 'signin' ? 'active' : ''} onClick={() => setMode('signin')} type="button">Sign in</button>
      </div>
      <form className="stack" onSubmit={submit}>
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@company.com" required /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={6} placeholder="At least 6 characters" required /></label>
        <button className="primary-button" disabled={busy} type="submit">
          {busy ? 'Please wait…' : mode === 'signup' ? 'Start building' : 'Sign in'}
        </button>
      </form>
      {message && <p className="form-message" role="status">{message}</p>}
    </div>
  );
}
