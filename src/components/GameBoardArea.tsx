import type { Chess, Color, Square } from 'chess.js';
import { getGameMessage, getGameResult } from '../lib/gameMessage';
import type { MoveSquares } from '../lib/moveSquares';
import type { MoveRating } from '../lib/moveRating';
import { ChessBoard } from './ChessBoard';
import { GameEndOverlay } from './GameEndOverlay';

type GameBoardAreaProps = {
  game: Chess;
  fen: string;
  lastMove?: MoveSquares;
  lastMoveRating?: MoveRating;
  selected?: Square;
  targets: Square[];
  playerColor: Color;
  isThinking: boolean;
  isGameOver: boolean;
  resigned: boolean;
  showEndOverlay: boolean;
  onSquareClick: (square: Square) => void;
  onMove: (from: Square, to: Square) => void;
  onNewGame: () => void;
  onReview: () => void;
  onReplayStep: (offset: number) => void;
};

export function GameBoardArea(props: GameBoardAreaProps) {
  const {
    game, fen, lastMove, lastMoveRating, selected, targets, playerColor, isThinking, isGameOver, resigned,
    showEndOverlay, onSquareClick, onMove, onNewGame, onReview, onReplayStep,
  } = props;
  const result = getGameResult(game, playerColor, resigned);

  return (
    <section className="board-area">
      <div className="player-row">
        <span className="player-avatar">Y</span>
        <div><b>You</b><small>{getGameMessage(game, isThinking, playerColor, resigned)}</small></div>
      </div>
      <div className={showEndOverlay ? 'board-stage board-stage--ended' : 'board-stage'}>
        <ChessBoard
          fen={fen}
          lastMove={lastMove}
          lastMoveRating={lastMoveRating}
          selected={selected}
          targets={targets}
          interactive={!isThinking && !isGameOver}
          playerColor={playerColor}
          onSquareClick={onSquareClick}
          onMove={onMove}
          onReplayStep={onReplayStep}
        />
        {showEndOverlay && result && (
          <GameEndOverlay result={result} onNewGame={onNewGame} onReview={onReview} />
        )}
      </div>
    </section>
  );
}
