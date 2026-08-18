import type { MoveRating } from './moveRating';

export const pieceSymbols: Record<string, string> = {
  wp: '♟', wn: '♞', wb: '♝', wr: '♜', wq: '♛', wk: '♚',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

export const boardFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

export const ratingMarks: Record<MoveRating, string> = {
  brilliant: '!!',
  good: '★',
  fine: '✓',
  inaccuracy: '?!',
  blunder: '??',
};
