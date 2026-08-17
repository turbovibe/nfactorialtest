import type { TimelineEntry } from '../lib/gameTimeline';
import { ratingLabels, type MoveRating } from '../lib/moveRating';

const ratings: MoveRating[] = ['brilliant', 'good', 'fine', 'inaccuracy', 'blunder'];

export function ReviewSummary({ entries }: { entries: TimelineEntry[] }) {
  const white = entries.filter((_, index) => index % 2 === 1);
  const black = entries.filter((_, index) => index > 0 && index % 2 === 0);

  return (
    <section className="review-summary" aria-label="Move quality summary">
      <div className="review-summary__heading"><span>Move quality</span><b>White</b><b>Black</b></div>
      {ratings.map((rating) => (
        <div className={`review-summary__row review-summary__row--${rating}`} key={rating}>
          <span>{ratingLabels[rating]}</span>
          <b>{white.filter((entry) => entry.rating === rating).length}</b>
          <b>{black.filter((entry) => entry.rating === rating).length}</b>
        </div>
      ))}
    </section>
  );
}
