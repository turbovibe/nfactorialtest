import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';
import type { Square } from 'chess.js';
import type { BoardArrow } from './boardAnnotations';

type ArrowDraft = BoardArrow & { moved: boolean };

export function useBoardAnnotations(positionKey: string) {
  const [markedSquares, setMarkedSquares] = useState<Set<Square>>(new Set());
  const [arrows, setArrows] = useState<BoardArrow[]>([]);
  const [draft, setDraft] = useState<ArrowDraft>();
  const draftRef = useRef<ArrowDraft>();

  useEffect(() => {
    setMarkedSquares(new Set());
    setArrows([]);
    setDraft(undefined);
    draftRef.current = undefined;
  }, [positionKey]);

  function startArrow(event: PointerEvent<HTMLButtonElement>, square: Square) {
    if (event.button === 0) {
      clearAnnotations();
      return;
    }
    if (event.button !== 2) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const next = { from: square, to: square, moved: false };
    draftRef.current = next;
    setDraft(next);
  }

  function moveArrow(event: PointerEvent<HTMLButtonElement>) {
    if (!draftRef.current) return;
    event.preventDefault();
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]');
    const square = target?.dataset.square as Square | undefined;
    if (!square) return;
    const next = { ...draftRef.current, to: square, moved: draftRef.current.moved || square !== draftRef.current.from };
    draftRef.current = next;
    setDraft(next);
  }

  function finishArrow(event: PointerEvent<HTMLButtonElement>) {
    const finished = draftRef.current;
    if (!finished) return;
    event.preventDefault();
    if (!finished.moved || finished.from === finished.to) toggleSquare(finished.from);
    else toggleArrow(finished);
    draftRef.current = undefined;
    setDraft(undefined);
  }

  function toggleSquare(square: Square) {
    setMarkedSquares((current) => {
      const next = new Set(current);
      if (next.has(square)) next.delete(square); else next.add(square);
      return next;
    });
  }

  function toggleArrow(arrow: BoardArrow) {
    setArrows((current) => current.some((item) => item.from === arrow.from && item.to === arrow.to)
      ? current.filter((item) => item.from !== arrow.from || item.to !== arrow.to)
      : [...current, arrow]);
  }

  function clearAnnotations() {
    setMarkedSquares(new Set());
    setArrows([]);
    setDraft(undefined);
    draftRef.current = undefined;
  }

  function preventMenu(event: MouseEvent) {
    event.preventDefault();
  }

  const visibleArrows = draft && draft.from !== draft.to ? [...arrows, draft] : arrows;
  return { markedSquares, arrows: visibleArrows, startArrow, moveArrow, finishArrow, preventMenu };
}
