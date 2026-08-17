import { useRef, useState, type PointerEvent } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import type { MoveSquares } from '../lib/moveSquares';
import { useBoardAnnotations } from '../lib/useBoardAnnotations';
import { BoardAnnotations } from './BoardAnnotations';

type ChessBoardProps = {
  fen: string;
  selected?: Square;
  targets?: Square[];
  interactive?: boolean;
  lastMove?: MoveSquares;
  playerColor: Color;
  onSquareClick?: (square: Square) => void;
  onMove?: (from: Square, to: Square) => void;
};

const symbols: Record<string, string> = {
  wp: '♟', wn: '♞', wb: '♝', wr: '♜', wq: '♛', wk: '♚',
  bp: '♟', bn: '♞', bb: '♝', br: '♜', bq: '♛', bk: '♚',
};

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

type PieceDrag = {
  from: Square;
  symbol: string;
  color: 'w' | 'b';
  x: number;
  y: number;
  grabX: number;
  grabY: number;
  size: number;
  angle: number;
};

export function ChessBoard({ fen, selected, targets = [], interactive, lastMove, playerColor, onSquareClick, onMove }: ChessBoardProps) {
  const [drag, setDrag] = useState<PieceDrag>();
  const annotations = useBoardAnnotations(fen);
  const lastPointer = useRef({ x: 0, y: 0 });
  const hasMoved = useRef(false);
  const game = new Chess(fen);
  const squares = Array.from({ length: 64 }, (_, index) => {
    const file = files[index % 8];
    const rank = 8 - Math.floor(index / 8);
    return `${file}${rank}` as Square;
  });
  if (playerColor === 'b') squares.reverse();

  function startDragging(event: PointerEvent<HTMLSpanElement>, square: Square, symbol: string) {
    if (event.button !== 0) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    lastPointer.current = { x: event.clientX, y: event.clientY };
    hasMoved.current = false;
    setDrag({
      from: square,
      symbol,
      color: playerColor,
      x: event.clientX,
      y: event.clientY,
      grabX: event.clientX - bounds.left,
      grabY: event.clientY - bounds.top,
      size: bounds.width,
      angle: 0,
    });
    onSquareClick?.(square);
  }

  function moveDraggedPiece(event: PointerEvent<HTMLSpanElement>) {
    if (!drag) return;
    const distance = Math.hypot(event.clientX - lastPointer.current.x, event.clientY - lastPointer.current.y);
    if (distance > 2) hasMoved.current = true;
    const speedX = event.clientX - lastPointer.current.x;
    lastPointer.current = { x: event.clientX, y: event.clientY };
    setDrag((current) => current && ({
      ...current,
      x: event.clientX,
      y: event.clientY,
      angle: Math.max(-24, Math.min(24, speedX * 1.8)),
    }));
  }

  function stopDragging(event: PointerEvent<HTMLSpanElement>) {
    if (!drag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-square]');
    const destination = target?.dataset.square as Square | undefined;
    if (hasMoved.current && destination && destination !== drag.from) onMove?.(drag.from, destination);
    setDrag(undefined);
  }

  return (
    <div className="chessboard" aria-label="Chess board">
      {squares.map((square, index) => {
        const piece = game.get(square);
        const isLight = (index + Math.floor(index / 8)) % 2 === 0;
        const isTarget = targets.includes(square);
        const lastMoveClass = square === lastMove?.from
          ? ' square--last-from'
          : square === lastMove?.to ? ' square--last-to' : '';
        const annotationClass = annotations.markedSquares.has(square) ? ' square--annotated' : '';
        return (
          <button
            className={`square ${isLight ? 'square--light' : 'square--dark'}${lastMoveClass}${annotationClass} ${selected === square ? 'square--selected' : ''}`}
            aria-disabled={!interactive}
            data-square={square}
            key={square}
            tabIndex={interactive ? 0 : -1}
            onClick={() => onSquareClick?.(square)}
            onContextMenu={annotations.preventMenu}
            onPointerDown={(event) => annotations.startArrow(event, square)}
            onPointerMove={annotations.moveArrow}
            onPointerUp={annotations.finishArrow}
            aria-label={`${square}${piece ? ` ${piece.color}${piece.type}` : ''}`}
          >
            {piece && (
              <span
                className={`piece piece--${piece.color} ${interactive && piece.color === playerColor ? 'piece--interactive' : ''} ${drag?.from === square ? 'piece--dragging' : ''}`}
                onClick={(event) => event.stopPropagation()}
                onPointerDown={interactive && piece.color === playerColor ? (event) => startDragging(event, square, symbols[`${piece.color}${piece.type}`]) : undefined}
                onPointerMove={moveDraggedPiece}
                onPointerUp={stopDragging}
                onPointerCancel={() => setDrag(undefined)}
              >
                {symbols[`${piece.color}${piece.type}`]}
              </span>
            )}
            {isTarget && <span className={piece ? 'capture-ring' : 'move-dot'} />}
            {index % 8 === 0 && <span className="rank-label">{square[1]}</span>}
            {index >= 56 && <span className="file-label">{square[0]}</span>}
          </button>
        );
      })}
      <BoardAnnotations arrows={annotations.arrows} orientation={playerColor} />
      {drag && (
        <span
          className={`dragged-piece piece--${drag.color}`}
          style={{
            left: drag.x - drag.grabX,
            top: drag.y - drag.grabY,
            width: drag.size,
            height: drag.size,
            transform: `rotate(${drag.angle}deg)`,
            transformOrigin: `${drag.grabX}px ${drag.grabY}px`,
          }}
        >
          {drag.symbol}
        </span>
      )}
    </div>
  );
}
