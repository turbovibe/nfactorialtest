import type { Chess, Color, Square } from 'chess.js';
import { getGameMessage, getGameResult } from '../lib/gameMessage';
import type { MoveSquares } from '../lib/moveSquares';
import { ChessBoard } from './ChessBoard';
import { GameEndOverlay } from './GameEndOverlay';

type GameBoardAreaProps = {
  game: Chess;
  fen: string;
  lastMove?: MoveSquares;
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
};

export function GameBoardArea(props: GameBoardAreaProps) {
  const {
    game, fen, lastMove, selected, targets, playerColor, isThinking, isGameOver, resigned,
    showEndOverlay, onSquareClick, onMove, onNewGame, onReview,
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
          selected={selected}
          targets={targets}
          interactive={!isThinking && !isGameOver}
          playerColor={playerColor}
          onSquareClick={onSquareClick}
          onMove={onMove}
        />
        {showEndOverlay && result && (
          <GameEndOverlay result={result} onNewGame={onNewGame} onReview={onReview} />
        )}
      </div>
    </section>
  );
}
