import { useState } from 'react';
import { savePermission } from '../lib/actions';
import type { ActionMode, ActionPermission } from '../lib/actionTypes';

const actions = [
  ['create_lead', 'Create CRM leads', 'Save a customer after they share contact details.'],
  ['book_appointment', 'Book appointments', 'Reserve a time on behalf of a customer.'],
  ['share_product', 'Recommend products', 'Share catalog items and prices in chat.'],
  ['human_handoff', 'Start human handoff', 'Escalate a conversation to your team.'],
] as const;

export function ActionPermissions({ organizationId, permissions, onSaved }: { organizationId: string; permissions: ActionPermission[]; onSaved: () => Promise<void> }) {
  const [saving, setSaving] = useState(''); const [error, setError] = useState('');
  const currentMode = (key: string) => permissions.find((item) => item.action_key === key)?.mode ?? 'approval';
  async function change(key: string, mode: ActionMode) { setSaving(key); setError(''); try { await savePermission(organizationId, key, mode); await onSaved(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not save permission.'); } finally { setSaving(''); } }
  return <section className="panel permissions-panel"><div className="panel-heading"><div><h2>Action permissions</h2><p>Choose how much autonomy your AI employee has.</p></div></div>
    <div className="permission-list">{actions.map(([key, title, note]) => <div key={key}><span><strong>{title}</strong><small>{note}</small></span><select aria-label={`${title} permission`} disabled={saving === key} value={currentMode(key)} onChange={(event) => void change(key, event.target.value as ActionMode)}><option value="automatic">Automatic</option><option value="approval">Needs approval</option><option value="disabled">Disabled</option></select></div>)}</div>
    {error && <p className="inline-error">{error}</p>}
  </section>;
}
