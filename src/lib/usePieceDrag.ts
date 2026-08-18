import { useRef, useState, type PointerEvent } from 'react';
import type { Color, Square } from 'chess.js';

type PieceDrag = {
  from: Square;
  symbol: string;
  color: Color;
  x: number;
  y: number;
  grabX: number;
  grabY: number;
  size: number;
  angle: number;
};

export function usePieceDrag(
  playerColor: Color,
  onSquareClick?: (square: Square) => void,
  onMove?: (from: Square, to: Square) => void,
) {
  const [drag, setDrag] = useState<PieceDrag>();
  const lastPointer = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);

  function start(event: PointerEvent<HTMLSpanElement>, square: Square, symbol: string) {
    if (event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointer.current = { x: event.clientX, y: event.clientY };
    hasMoved.current = false;
    setDrag({
      from: square, symbol, color: playerColor, x: event.clientX, y: event.clientY,
      grabX: event.clientX - bounds.left, grabY: event.clientY - bounds.top,
      size: bounds.width, angle: 0,
    });
    onSquareClick?.(square);
  }

  function move(event: PointerEvent<HTMLSpanElement>) {
    if (!drag) return;
    if (Math.hypot(event.clientX - lastPointer.current.x, event.clientY - lastPointer.current.y) > 2) {
      hasMoved.current = true;
    }
    const speedX = event.clientX - lastPointer.current.x;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setDrag((current) => current && ({
      ...current, x: event.clientX, y: event.clientY,
      angle: Math.max(-24, Math.min(24, speedX * 1.8)),
    }));
  }

  function stop(event: PointerEvent<HTMLSpanElement>) {
    if (!drag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]');
    const destination = target?.dataset.square as Square | undefined;
    if (hasMoved.current && destination && destination !== drag.from) onMove?.(drag.from, destination);
    setDrag(undefined);
  }

  return { drag, start, move, stop, cancel: () => setDrag(undefined) };
}
