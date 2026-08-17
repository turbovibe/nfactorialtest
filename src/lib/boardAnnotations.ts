import type { Color, Square } from 'chess.js';

export type BoardArrow = {
  from: Square;
  to: Square;
};

type Point = { x: number; y: number };

function squareCenter(square: Square, orientation: Color): Point {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]) - 1;
  const x = orientation === 'w' ? file : 7 - file;
  const y = orientation === 'w' ? 7 - rank : rank;
  return { x: x * 100 + 50, y: y * 100 + 50 };
}

export function arrowPath(arrow: BoardArrow, orientation: Color): string {
  const start = squareCenter(arrow.from, orientation);
  const end = squareCenter(arrow.to, orientation);
  const fileDistance = Math.abs(arrow.from.charCodeAt(0) - arrow.to.charCodeAt(0));
  const rankDistance = Math.abs(Number(arrow.from[1]) - Number(arrow.to[1]));
  const isKnightMove = fileDistance * rankDistance === 2;
  if (!isKnightMove) return `M ${start.x} ${start.y} L ${end.x} ${end.y}`;

  const corner = fileDistance === 2
    ? { x: end.x, y: start.y }
    : { x: start.x, y: end.y };
  return `M ${start.x} ${start.y} L ${corner.x} ${corner.y} L ${end.x} ${end.y}`;
}
