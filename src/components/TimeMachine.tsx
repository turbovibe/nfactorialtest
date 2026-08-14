export type TimelineEntry = {
  fen: string;
  move: string;
  actor: 'Start' | 'You' | 'Echo';
  explanation: string;
  clue?: string;
};

type TimeMachineProps = {
  entries: TimelineEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function TimeMachine({ entries, activeIndex, onSelect }: TimeMachineProps) {
  return (
    <section className="time-machine">
      <div className="time-machine__heading">
        <div><span>Time machine</span><h2>Replay the thinking</h2></div>
        <b>{activeIndex < entries.length - 1 ? 'PAST POSITION' : `${entries.length - 1} MOVES`}</b>
      </div>
      <div className="timeline">
        {entries.map((entry, index) => (
          <button
            className={activeIndex === index ? 'timeline__step timeline__step--active' : 'timeline__step'}
            key={`${entry.move}-${index}`}
            onClick={() => onSelect(index)}
            title={entry.clue ?? entry.move}
          >
            <i className={entry.clue ? 'has-clue' : ''} />
            <span>{index === 0 ? 'Start' : entry.move}</span>
          </button>
        ))}
      </div>
      <div className="move-explanation">
        <div><span>{entries[activeIndex].actor}</span><strong>{entries[activeIndex].move}</strong></div>
        <p>{entries[activeIndex].explanation}</p>
      </div>
      {entries[activeIndex]?.clue && (
        <div className="detective-clue"><span>⌕</span><div><b>Detective clue</b><p>{entries[activeIndex].clue}</p></div></div>
      )}
    </section>
  );
}
