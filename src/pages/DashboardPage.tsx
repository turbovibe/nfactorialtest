import { useEffect, useState } from 'react';
import { Link, Redirect } from 'wouter';
import { AppShell } from '../components/AppShell';
import { MetricCard } from '../components/MetricCard';
import { SetupChecklist } from '../components/SetupChecklist';
import { loadOrganization, type Organization } from '../lib/organizations';

export function DashboardPage() {
  const [organization, setOrganization] = useState<Organization | null>();
  const [error, setError] = useState('');

  useEffect(() => {
    void loadOrganization()
      .then(setOrganization)
      .catch((caught: Error) => setError(caught.message));
  }, []);

  if (error) return <main className="centered-page"><div><h1>Could not load workspace</h1><p>{error}</p></div></main>;
  if (organization === undefined) return <main className="centered-page">Loading workspace…</main>;
  if (organization === null) return <Redirect to="/onboarding" />;

  return (
    <AppShell organizationName={organization.name}>
      <header className="dashboard-header"><div><p className="eyebrow">Overview</p><h1>Good morning</h1><p>Here’s what your AI employee is doing for {organization.name}.</p></div><Link className="primary-button" href="/conversations">Test Operator</Link></header>
      <section className="metrics">
        <MetricCard label="Conversations" value="0" note="Ready after widget install" />
        <MetricCard label="Qualified leads" value="0" note="No leads yet" />
        <MetricCard label="Business generated" value="$0" note="Attribution starts automatically" />
      </section>
      <div className="dashboard-grid">
        <SetupChecklist />
        <section className="panel activity-panel"><div className="panel-heading"><div><h2>Recent activity</h2><p>Customer conversations and actions will appear here.</p></div></div><div className="empty-state"><span>◌</span><strong>Quiet for now</strong><p>Install your widget to start receiving conversations.</p></div></section>
      </div>
    </AppShell>
  );
}
