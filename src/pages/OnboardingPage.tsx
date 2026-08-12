import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { Brand } from '../components/Brand';
import { createOrganization } from '../lib/organizations';

export function OnboardingPage() {
  const [, navigate] = useLocation();
  const [name, setName] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await createOrganization(name.trim(), website.trim());
      navigate('/dashboard');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create the workspace.');
      setBusy(false);
    }
  }

  return (
    <main className="onboarding-page">
      <Brand />
      <section className="onboarding-card">
        <p className="step-label">Workspace setup · 1 of 1</p>
        <h1>Tell us about your business</h1>
        <p>This becomes the home for your AI employee, knowledge, conversations, and results.</p>
        <form className="stack" onSubmit={submit}>
          <label>Business name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Acme Studio" required /></label>
          <label>Website <small>Optional</small><input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://acme.com" /></label>
          <button className="primary-button" disabled={busy} type="submit">{busy ? 'Creating…' : 'Create workspace'}</button>
        </form>
        {error && <p className="form-message" role="alert">{error}</p>}
      </section>
    </main>
  );
}
