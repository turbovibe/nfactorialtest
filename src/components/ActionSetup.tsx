import { useEffect, useState, type FormEvent } from 'react';
import { saveSettings } from '../lib/actions';
import type { ActionSettings } from '../lib/actionTypes';

const emptySettings: ActionSettings = {
  calendar_provider: null, calendar_url: null, human_handoff_enabled: false, handoff_email: null,
};

export function ActionSetup({ organizationId, settings, onSaved }: {
  organizationId: string; settings: ActionSettings | null; onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState(settings ?? emptySettings);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => setForm(settings ?? emptySettings), [settings]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      await saveSettings(organizationId, form); await onSaved(); setMessage('Settings saved.');
    } catch (caught) { setMessage(caught instanceof Error ? caught.message : 'Could not save settings.'); }
    finally { setBusy(false); }
  }

  return (
    <form className="actions-grid" onSubmit={submit}>
      <section className="panel action-card">
        <div className="action-icon">CAL</div><h2>Calendar integration</h2>
        <p>Choose the calendar where confirmed appointments should be opened.</p>
        <label>Provider<select value={form.calendar_provider ?? ''} onChange={(event) => setForm({ ...form, calendar_provider: event.target.value as ActionSettings['calendar_provider'] || null })}><option value="">Not connected</option><option value="google">Google Calendar</option><option value="outlook">Outlook Calendar</option></select></label>
        <label>Calendar or booking URL<input type="url" placeholder="https://calendar.google.com/..." value={form.calendar_url ?? ''} onChange={(event) => setForm({ ...form, calendar_url: event.target.value || null })} /></label>
      </section>
      <section className="panel action-card">
        <div className="action-icon">HUM</div><h2>Human handoff</h2>
        <p>Let the AI escalate sensitive or complex conversations to a person.</p>
        <label className="toggle-row"><span><strong>Enable handoff</strong><small>Offer escalation when needed</small></span><input type="checkbox" checked={form.human_handoff_enabled} onChange={(event) => setForm({ ...form, human_handoff_enabled: event.target.checked })} /></label>
        <label>Team email<input type="email" required={form.human_handoff_enabled} placeholder="support@company.com" value={form.handoff_email ?? ''} onChange={(event) => setForm({ ...form, handoff_email: event.target.value || null })} /></label>
      </section>
      <div className="action-save"><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : 'Save integrations'}</button>{message && <span>{message}</span>}</div>
    </form>
  );
}
