export type MoveRating = 'blunder' | 'inaccuracy' | 'fine' | 'good' | 'brilliant';

export const ratingLabels: Record<MoveRating, string> = {
  blunder: 'Blunder',
  inaccuracy: 'Inaccuracy',
  fine: 'Fine',
  good: 'Good',
  brilliant: 'Brilliant',
};
