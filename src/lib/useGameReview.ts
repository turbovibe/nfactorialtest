import { useEffect, useMemo, useState } from 'react';
import type { TimelineEntry } from './gameTimeline';
import { adaptiveReviewDepth, reviewGame } from './gameReview';
import type { MoveRating } from './moveRating';

export type ReviewStatus = 'idle' | 'analyzing' | 'ready' | 'error';

export function useGameReview(entries: TimelineEntry[], isGameOver: boolean) {
  const [ratings, setRatings] = useState<MoveRating[]>([]);
  const [evaluations, setEvaluations] = useState<number[]>([]);
  const [bestMoves, setBestMoves] = useState<(string | undefined)[]>([]);
  const [status, setStatus] = useState<ReviewStatus>('idle');
  const [progress, setProgress] = useState(0);
  const depth = useMemo(() => adaptiveReviewDepth(entries.length - 1), [entries.length]);
  const positionKey = entries.map((entry) => entry.fen).join('|');

  useEffect(() => {
    const controller = new AbortController();
    setRatings([]);
    setEvaluations([]);
    setBestMoves([]);
    setProgress(0);
    setStatus(isGameOver ? 'analyzing' : 'idle');
    if (!isGameOver) return () => controller.abort();

    void reviewGame(entries, setProgress, controller.signal)
      .then((review) => {
        if (controller.signal.aborted) return;
        setRatings(review.ratings);
        setEvaluations(review.evaluations);
        setBestMoves(review.bestMoves);
        setStatus('ready');
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        setStatus('error');
      });
    return () => controller.abort();
  }, [isGameOver, positionKey]);

  const reviewedEntries = entries.map((entry, index) => ({
    ...entry,
    rating: index === 0 ? undefined : ratings[index - 1],
    evaluationCp: evaluations[index],
    bestMove: index === 0 ? undefined : bestMoves[index - 1],
  }));

  return { reviewedEntries, status, progress, depth };
}
