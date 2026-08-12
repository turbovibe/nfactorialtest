export type ActionMode = 'automatic' | 'approval' | 'disabled';

export type ActionSettings = {
  calendar_provider: 'google' | 'outlook' | null;
  calendar_url: string | null;
  human_handoff_enabled: boolean;
  handoff_email: string | null;
};

export type Product = { id: string; name: string; price: number; description: string | null; active: boolean };
export type Lead = { id: string; name: string; email: string; status: string; created_at: string };
export type Appointment = { id: string; customer_name: string; customer_email: string; starts_at: string; status: string };
export type ActionPermission = { action_key: string; mode: ActionMode };
export type AuditLog = { id: string; action: string; entity_type: string; created_at: string };

export type ActionsData = {
  settings: ActionSettings | null;
  products: Product[];
  leads: Lead[];
  appointments: Appointment[];
  permissions: ActionPermission[];
  logs: AuditLog[];
};
