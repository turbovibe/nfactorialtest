import { ratingLabels, type MoveRating } from '../lib/moveRating';

export type TimelineEntry = {
  fen: string;
  move: string;
  rating?: MoveRating;
};

type TimeMachineProps = {
  entries: TimelineEntry[];
  activeIndex: number;
  isGameOver: boolean;
  onSelect: (index: number) => void;
};

const legendRatings: MoveRating[] = ['blunder', 'inaccuracy', 'book', 'fine', 'good', 'brilliant'];

export function TimeMachine({ entries, activeIndex, isGameOver, onSelect }: TimeMachineProps) {
  return (
    <section className="time-machine">
      <div className="time-machine__heading">
        <div><span>Time machine</span><h2>{isGameOver ? 'Game review' : 'Review after the game'}</h2></div>
        <b>{isGameOver ? `${entries.length - 1} MOVES` : 'LOCKED'}</b>
      </div>
      {!isGameOver ? (
        <p className="timeline-locked">Finish the game to reveal every move rating.</p>
      ) : (
        <>
          <div className="timeline">
            {entries.map((entry, index) => {
              const ratingClass = entry.rating ? ` timeline__step--${entry.rating}` : '';
              return (
                <button
                  aria-label={index === 0 ? 'Starting position' : `${entry.move}: ${ratingLabels[entry.rating ?? 'fine']}`}
                  className={`timeline__step${ratingClass}${activeIndex === index ? ' timeline__step--active' : ''}`}
                  key={`${entry.move}-${index}`}
                  onClick={() => onSelect(index)}
                  title={index === 0 ? 'Starting position' : `${entry.move} · ${ratingLabels[entry.rating ?? 'fine']}`}
                >
                  <i />
                  <span>{index === 0 ? 'Start' : entry.move}</span>
                </button>
              );
            })}
          </div>
          <div className="rating-legend">
            {legendRatings.map((rating) => <span className={`rating-legend__${rating}`} key={rating}><i />{ratingLabels[rating]}</span>)}
          </div>
        </>
      )}
    </section>
  );
}
