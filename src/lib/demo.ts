import type { ActionsData } from './actionTypes';
import type { Organization } from './organizations';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

export const demoOrganization: Organization = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Acme Demo',
  website: 'https://example.com',
  created_at: new Date().toISOString(),
};

const storageKey = 'operator-demo-actions';
const initialData: ActionsData = {
  settings: { calendar_provider: 'google', calendar_url: 'https://calendar.google.com', human_handoff_enabled: true, handoff_email: 'team@example.com' },
  products: [
    { id: 'demo-product-1', name: 'Growth plan', price: 49, description: 'For growing teams', active: true },
    { id: 'demo-product-2', name: 'Starter plan', price: 19, description: 'For small businesses', active: true },
  ],
  leads: [{ id: 'demo-lead-1', name: 'Maya Chen', email: 'maya@example.com', status: 'qualified', created_at: new Date().toISOString() }],
  appointments: [{ id: 'demo-appointment-1', customer_name: 'Alex Morgan', customer_email: 'alex@example.com', starts_at: new Date(Date.now() + 86400000).toISOString(), status: 'booked' }],
  permissions: [
    { action_key: 'create_lead', mode: 'automatic' }, { action_key: 'book_appointment', mode: 'approval' },
    { action_key: 'share_product', mode: 'automatic' }, { action_key: 'human_handoff', mode: 'approval' },
  ],
  logs: [{ id: 'demo-log-1', action: 'insert', entity_type: 'leads', created_at: new Date().toISOString() }],
};

export function loadDemoData(): ActionsData {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) as ActionsData : structuredClone(initialData);
}

export function updateDemoData(change: (data: ActionsData) => void, entityType: string) {
  const data = loadDemoData();
  change(data);
  data.logs.unshift({ id: crypto.randomUUID(), action: 'update', entity_type: entityType, created_at: new Date().toISOString() });
  localStorage.setItem(storageKey, JSON.stringify(data));
}
