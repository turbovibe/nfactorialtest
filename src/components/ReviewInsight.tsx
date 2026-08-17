import { ratingLabels } from '../lib/moveRating';
import type { TimelineEntry } from '../lib/gameTimeline';

type ReviewInsightProps = {
  entry?: TimelineEntry;
  index: number;
  depth: number;
};

export function ReviewInsight({ entry, index, depth }: ReviewInsightProps) {
  if (!entry || index === 0) {
    return <section className="review-insight"><span>Starting position</span><h2>Ready to rewind</h2><p>Choose any move to see the board immediately after it was played.</p></section>;
  }

  const rating = entry.rating;
  if (!rating) {
    return <section className="review-insight"><span>Move {Math.ceil(index / 2)}</span><h2>{entry.move}</h2><p>Stockfish 18 is checking this position now. You can keep exploring while it works.</p></section>;
  }
  const evaluation = entry.evaluationCp === undefined
    ? '—'
    : `${entry.evaluationCp >= 0 ? '+' : ''}${(entry.evaluationCp / 100).toFixed(2)}`;
  return (
    <section className={`review-insight review-insight--${rating}`}>
      <span>Move {Math.ceil(index / 2)} · {index % 2 ? 'White' : 'Black'}</span>
      <h2>{entry.move} <em>{ratingLabels[rating]}</em></h2>
      <p>
        Evaluation {evaluation} · depth {depth}.
        {entry.bestMove && entry.bestMove !== entry.move ? ` Stockfish preferred ${entry.bestMove}.` : ' This matched Stockfish’s first choice.'}
      </p>
    </section>
  );
}
