import { useState } from 'react';
import { ToolNav } from '../components/ToolNav';

const moments = [
  { move: 'Start', note: 'Every game begins with the same position and many possible plans.' },
  { move: '1. e4', note: 'White controls the centre and opens lines for the queen and bishop.' },
  { move: '…e5', note: 'Black answers in the centre and keeps the position balanced.' },
  { move: '2. Nf3', note: 'The knight develops while attacking the e5 pawn.' },
];

export function TimeMachinePage() {
  const [active, setActive] = useState(0);

  return (
    <main className="tools-page">
      <ToolNav />
      <section className="tool-workspace">
        <p className="eyebrow">Tool 02</p><h1>Time Machine</h1>
        <p className="workspace-lead">Select a moment to understand how the position changed.</p>
        <div className="lesson-timeline">
          {moments.map((moment, index) => (
            <button className={active === index ? 'lesson-step lesson-step--active' : 'lesson-step'} onClick={() => setActive(index)} key={moment.move}>
              <span>{String(index).padStart(2, '0')}</span>{moment.move}
            </button>
          ))}
        </div>
        <article className="lesson-result"><span>Selected moment</span><h2>{moments[active].move}</h2><p>{moments[active].note}</p></article>
      </section>
    </main>
  );
}
