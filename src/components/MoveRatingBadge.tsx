import { ratingMarks } from '../lib/boardDisplay';
import { ratingLabels, type MoveRating } from '../lib/moveRating';

export function MoveRatingBadge({ rating }: { rating: MoveRating }) {
  return (
    <span className="move-rating-badge" title={ratingLabels[rating]} aria-label={ratingLabels[rating]}>
      {ratingMarks[rating]}
    </span>
  );
}
