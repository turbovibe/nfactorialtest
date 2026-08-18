import type { Color } from 'chess.js';
import type { PointerEventHandler } from 'react';

type BoardPieceProps = {
  color: Color;
  symbol: string;
  interactive: boolean;
  dragging: boolean;
  onStart?: PointerEventHandler<HTMLSpanElement>;
  onMove: PointerEventHandler<HTMLSpanElement>;
  onStop: PointerEventHandler<HTMLSpanElement>;
  onCancel: () => void;
};

export function BoardPiece(props: BoardPieceProps) {
  const { color, symbol, interactive, dragging, onStart, onMove, onStop, onCancel } = props;
  return (
    <span
      className={`piece piece--${color} ${interactive ? 'piece--interactive' : ''} ${dragging ? 'piece--dragging' : ''}`}
      onClick={(event) => event.stopPropagation()}
      onPointerDown={onStart}
      onPointerMove={onMove}
      onPointerUp={onStop}
      onPointerCancel={onCancel}
    >
      {symbol}
    </span>
  );
}
