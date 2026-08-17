import { Chess, type Square } from 'chess.js';
import type { TimelineEntry } from './gameTimeline';

export type MoveSquares = {
  from: Square;
  to: Square;
};

export function findMoveSquares(entries: TimelineEntry[], activeIndex: number): MoveSquares | undefined {
  const before = entries[activeIndex - 1];
  const current = entries[activeIndex];
  if (!before || !current) return undefined;

  try {
    const move = new Chess(before.fen).move(current.move);
    return { from: move.from, to: move.to };
  } catch {
    return undefined;
  }
}
