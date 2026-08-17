import { ratingLabels } from '../lib/moveRating';
import type { TimelineEntry } from '../lib/gameTimeline';

type ReviewMoveListProps = {
  entries: TimelineEntry[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function ReviewMoveList({ entries, activeIndex, onSelect }: ReviewMoveListProps) {
  const rows = Array.from({ length: Math.ceil((entries.length - 1) / 2) }, (_, row) => ({
    white: entries[row * 2 + 1],
    black: entries[row * 2 + 2],
  }));

  return (
    <div className="review-moves">
      <div className="review-moves__header"><span>#</span><b>White</b><b>Black</b></div>
      <div className="review-moves__scroll">
        {rows.map((row, rowIndex) => (
          <div className="review-moves__row" key={rowIndex}>
            <span>{rowIndex + 1}.</span>
            {[row.white, row.black].map((entry, colorIndex) => {
              if (!entry) return <i key={colorIndex} />;
              const entryIndex = rowIndex * 2 + colorIndex + 1;
              const rating = entry.rating;
              return (
                <button
                  className={`review-move review-move--${rating ?? 'pending'}${activeIndex === entryIndex ? ' review-move--active' : ''}`}
                  key={entryIndex}
                  onClick={() => onSelect(entryIndex)}
                  title={rating ? ratingLabels[rating] : 'Analysis pending'}
                  type="button"
                >
                  <span>{entry.move}</span><small>{rating ? ratingLabels[rating] : 'Analyzing'}</small>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
