const steps = [
  { title: 'Create your workspace', text: 'Your business is ready.', done: true },
  { title: 'Add business knowledge', text: 'Upload pages and documents.', done: false },
  { title: 'Install the website widget', text: 'Start talking to visitors.', done: false },
  { title: 'Connect an action', text: 'Let Operator capture and qualify leads.', done: false },
];

export function SetupChecklist() {
  return (
    <section className="panel setup-panel">
      <div className="panel-heading"><div><h2>Launch checklist</h2><p>Complete these steps to put Operator to work.</p></div><span>1 / 4</span></div>
      <div className="progress"><i /></div>
      <ol className="checklist">
        {steps.map((step, index) => <li key={step.title} className={step.done ? 'done' : ''}><span>{step.done ? '✓' : index + 1}</span><div><strong>{step.title}</strong><p>{step.text}</p></div><b>›</b></li>)}
      </ol>
    </section>
  );
}
