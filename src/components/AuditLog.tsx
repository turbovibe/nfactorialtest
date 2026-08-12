import type { AuditLog as AuditLogItem } from '../lib/actionTypes';

const entityNames: Record<string, string> = { action_settings: 'integrations', products: 'product', leads: 'lead', appointments: 'appointment', action_permissions: 'permission' };

export function AuditLog({ logs }: { logs: AuditLogItem[] }) {
  return <section className="panel audit-panel"><div className="panel-heading"><div><h2>Audit log</h2><p>A read-only history of action changes.</p></div><span>Last 30</span></div>
    <div className="audit-list">{logs.map((log) => <div key={log.id}><span className="audit-dot" /><span><strong>{log.action} {entityNames[log.entity_type] ?? log.entity_type}</strong><small>{new Date(log.created_at).toLocaleString()}</small></span></div>)}{!logs.length && <p className="list-empty">Changes will appear here.</p>}</div>
  </section>;
}
