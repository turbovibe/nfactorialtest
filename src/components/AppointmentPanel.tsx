import { useState, type FormEvent } from 'react';
import { createAppointment } from '../lib/actions';
import type { Appointment } from '../lib/actionTypes';

export function AppointmentPanel({ organizationId, appointments, onCreated }: { organizationId: string; appointments: Appointment[]; onCreated: () => Promise<void> }) {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [startsAt, setStartsAt] = useState(''); const [error, setError] = useState('');
  async function submit(event: FormEvent) { event.preventDefault(); setError(''); try { await createAppointment(organizationId, { customer_name: name.trim(), customer_email: email.trim(), starts_at: new Date(startsAt).toISOString() }); setName(''); setEmail(''); setStartsAt(''); await onCreated(); } catch (caught) { setError(caught instanceof Error ? caught.message : 'Could not book appointment.'); } }
  return <section className="panel record-panel wide-panel"><div className="panel-heading"><div><h2>Appointments</h2><p>Bookings ready for calendar sync.</p></div><span>{appointments.length} booked</span></div>
    <form className="compact-form" onSubmit={submit}><input aria-label="Customer name" placeholder="Customer name" required value={name} onChange={(e) => setName(e.target.value)} /><input aria-label="Customer email" type="email" placeholder="Email" required value={email} onChange={(e) => setEmail(e.target.value)} /><input aria-label="Appointment time" type="datetime-local" required value={startsAt} onChange={(e) => setStartsAt(e.target.value)} /><button className="primary-button">Book</button></form>
    {error && <p className="inline-error">{error}</p>}<div className="record-list">{appointments.map((item) => <div key={item.id}><span><strong>{item.customer_name}</strong><small>{item.customer_email}</small></span><b>{new Date(item.starts_at).toLocaleString()}</b></div>)}{!appointments.length && <p className="list-empty">No appointments yet.</p>}</div>
  </section>;
}
