import { Chess, type Color, type Square } from 'chess.js';
import { boardFiles, pieceSymbols } from '../lib/boardDisplay';
import type { MoveSquares } from '../lib/moveSquares';
import type { MoveRating } from '../lib/moveRating';
import { useBoardAnnotations } from '../lib/useBoardAnnotations';
import { useBoardReplayKeys } from '../lib/useBoardReplayKeys';
import { usePieceDrag } from '../lib/usePieceDrag';
import { BoardPiece } from './BoardPiece';
import { BoardAnnotations } from './BoardAnnotations';
import { MoveRatingBadge } from './MoveRatingBadge';

type ChessBoardProps = {
  fen: string;
  selected?: Square;
  targets?: Square[];
  interactive?: boolean;
  lastMove?: MoveSquares;
  lastMoveRating?: MoveRating;
  playerColor: Color;
  onReplayStep?: (offset: number) => void;
  onSquareClick?: (square: Square) => void;
  onMove?: (from: Square, to: Square) => void;
};

export function ChessBoard({
  fen, selected, targets = [], interactive, lastMove, lastMoveRating, playerColor,
  onReplayStep, onSquareClick, onMove,
}: ChessBoardProps) {
  const annotations = useBoardAnnotations(fen);
  const handleReplayKey = useBoardReplayKeys(onReplayStep);
  const pieceDrag = usePieceDrag(playerColor, onSquareClick, onMove);
  const { drag } = pieceDrag;
  const game = new Chess(fen);
  const squares = Array.from({ length: 64 }, (_, index) => {
    const file = boardFiles[index % 8];
    const rank = 8 - Math.floor(index / 8);
    return `${file}${rank}` as Square;
  });
  if (playerColor === 'b') squares.reverse();

  return (
    <div
      className={`chessboard${lastMoveRating ? ` chessboard--rating-${lastMoveRating}` : ''}`}
      aria-label={onReplayStep ? 'Chess board. Use arrow keys to move through the game.' : 'Chess board'}
      tabIndex={onReplayStep ? 0 : undefined}
      onKeyDown={handleReplayKey}
    >
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
              <BoardPiece
                color={piece.color}
                symbol={pieceSymbols[`${piece.color}${piece.type}`]}
                interactive={Boolean(interactive && piece.color === playerColor)}
                dragging={drag?.from === square}
                onStart={interactive && piece.color === playerColor
                  ? (event) => pieceDrag.start(event, square, pieceSymbols[`${piece.color}${piece.type}`])
                  : undefined}
                onMove={pieceDrag.move}
                onStop={pieceDrag.stop}
                onCancel={pieceDrag.cancel}
              />
            )}
            {piece && square === lastMove?.to && lastMoveRating && (
              <MoveRatingBadge rating={lastMoveRating} />
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
