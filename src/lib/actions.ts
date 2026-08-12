import { supabase } from './supabase';
import type { ActionMode, ActionSettings, ActionsData } from './actionTypes';
import { isDemoMode, loadDemoData, updateDemoData } from './demo';

function unwrap<T>(result: { data: T | null; error: Error | null }): T {
  if (result.error) throw result.error;
  return result.data as T;
}

export async function loadActionsData(organizationId: string): Promise<ActionsData> {
  if (isDemoMode) return loadDemoData();
  const [settings, products, leads, appointments, permissions, logs] = await Promise.all([
    supabase.from('action_settings').select('calendar_provider, calendar_url, human_handoff_enabled, handoff_email').eq('organization_id', organizationId).maybeSingle(),
    supabase.from('products').select('id, name, price, description, active').eq('organization_id', organizationId).order('created_at', { ascending: false }),
    supabase.from('leads').select('id, name, email, status, created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }),
    supabase.from('appointments').select('id, customer_name, customer_email, starts_at, status').eq('organization_id', organizationId).order('starts_at'),
    supabase.from('action_permissions').select('action_key, mode').eq('organization_id', organizationId),
    supabase.from('action_audit_logs').select('id, action, entity_type, created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(30),
  ]);

  return {
    settings: unwrap(settings), products: unwrap(products), leads: unwrap(leads),
    appointments: unwrap(appointments), permissions: unwrap(permissions), logs: unwrap(logs),
  } as ActionsData;
}

export async function saveSettings(organizationId: string, settings: ActionSettings) {
  if (isDemoMode) {
    updateDemoData((data) => { data.settings = settings; }, 'action_settings');
    return;
  }
  const { error } = await supabase.from('action_settings').upsert(
    { organization_id: organizationId, ...settings, updated_at: new Date().toISOString() },
    { onConflict: 'organization_id' },
  );
  if (error) throw error;
}

export async function createProduct(organizationId: string, values: { name: string; price: number; description: string }) {
  if (isDemoMode) {
    updateDemoData((data) => data.products.unshift({ id: crypto.randomUUID(), ...values, active: true }), 'products');
    return;
  }
  const { error } = await supabase.from('products').insert({ organization_id: organizationId, ...values });
  if (error) throw error;
}

export async function createLead(organizationId: string, values: { name: string; email: string }) {
  if (isDemoMode) {
    updateDemoData((data) => data.leads.unshift({ id: crypto.randomUUID(), ...values, status: 'new', created_at: new Date().toISOString() }), 'leads');
    return;
  }
  const { error } = await supabase.from('leads').insert({ organization_id: organizationId, ...values });
  if (error) throw error;
}

export async function createAppointment(organizationId: string, values: { customer_name: string; customer_email: string; starts_at: string }) {
  if (isDemoMode) {
    updateDemoData((data) => data.appointments.unshift({ id: crypto.randomUUID(), ...values, status: 'booked' }), 'appointments');
    return;
  }
  const { error } = await supabase.from('appointments').insert({ organization_id: organizationId, ...values });
  if (error) throw error;
}

export async function savePermission(organizationId: string, actionKey: string, mode: ActionMode) {
  if (isDemoMode) {
    updateDemoData((data) => {
      const permission = data.permissions.find((item) => item.action_key === actionKey);
      if (permission) permission.mode = mode;
      else data.permissions.push({ action_key: actionKey, mode });
    }, 'action_permissions');
    return;
  }
  const { error } = await supabase.from('action_permissions').upsert(
    { organization_id: organizationId, action_key: actionKey, mode, updated_at: new Date().toISOString() },
    { onConflict: 'organization_id,action_key' },
  );
  if (error) throw error;
}
