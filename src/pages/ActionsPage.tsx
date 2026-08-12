import { useState } from 'react';
import { Redirect } from 'wouter';
import { ActionPermissions } from '../components/ActionPermissions';
import { ActionSetup } from '../components/ActionSetup';
import { AppointmentPanel } from '../components/AppointmentPanel';
import { AppShell } from '../components/AppShell';
import { AuditLog } from '../components/AuditLog';
import { LeadPanel } from '../components/LeadPanel';
import { ProductPanel } from '../components/ProductPanel';
import { useActionsData } from '../hooks/useActionsData';

type Tab = 'integrations' | 'records' | 'permissions' | 'audit';
const tabs: { id: Tab; label: string }[] = [
  { id: 'integrations', label: 'Integrations' }, { id: 'records', label: 'CRM & catalog' },
  { id: 'permissions', label: 'Permissions' }, { id: 'audit', label: 'Audit log' },
];

export function ActionsPage() {
  const [tab, setTab] = useState<Tab>('integrations');
  const { organization, data, error, refresh } = useActionsData();
  if (error) return <main className="centered-page"><div><h1>Could not load actions</h1><p>{error}</p></div></main>;
  if (organization === undefined || !data) return <main className="centered-page">Loading actions...</main>;
  if (organization === null) return <Redirect to="/onboarding" />;

  return <AppShell organizationName={organization.name}>
    <header className="dashboard-header actions-header"><div><p className="eyebrow">Actions</p><h1>Turn conversations into results</h1><p>Connect your tools and control what your AI employee can do.</p></div></header>
    <div className="action-tabs" role="tablist">{tabs.map((item) => <button className={tab === item.id ? 'active' : ''} key={item.id} onClick={() => setTab(item.id)}>{item.label}</button>)}</div>
    {tab === 'integrations' && <ActionSetup organizationId={organization.id} settings={data.settings} onSaved={refresh} />}
    {tab === 'records' && <div className="records-grid"><ProductPanel organizationId={organization.id} products={data.products} onCreated={refresh} /><LeadPanel organizationId={organization.id} leads={data.leads} onCreated={refresh} /><AppointmentPanel organizationId={organization.id} appointments={data.appointments} onCreated={refresh} /></div>}
    {tab === 'permissions' && <ActionPermissions organizationId={organization.id} permissions={data.permissions} onSaved={refresh} />}
    {tab === 'audit' && <AuditLog logs={data.logs} />}
  </AppShell>;
}
