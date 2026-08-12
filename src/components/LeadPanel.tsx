import { useState, type FormEvent } from 'react';
import { createLead } from '../lib/actions';
import type { Lead } from '../lib/actionTypes';

export function LeadPanel({ organizationId, leads, onCreated }: { organizationId: string; leads: Lead[]; onCreated: () => Promise<void> }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [error, setError] = useState('');
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); try { await createLead(organizationId, { name: name.trim(), email: email.trim() }); setName(''); setEmail(''); await onCreated(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not create lead.'); } }
  return <section className="panel record-panel"><div className="panel-heading"><div><h2>CRM leads</h2><p>Create and track customer interest.</p></div><span>{leads.length} leads</span></div>
    <form className="compact-form compact-form-short" onSubmit={submit}><input aria-label="Lead name" placeholder="Full name" required value={name} onChange={(e) => setName(e.target.value)} /><input aria-label="Lead email" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /><button className="primary-button">Create</button></form>
    {error && <p className="inline-error">{error}</p>}<div className="record-list">{leads.map((lead) => <div key={lead.id}><span><strong>{lead.name}</strong><small>{lead.email}</small></span><i className="status-pill">{lead.status}</i></div>)}{!leads.length && <p className="list-empty">No leads yet.</p>}</div>
  </section>;
}
