export type GameResult = 'win' | 'loss' | 'draw';

type GameEndOverlayProps = {
  result: GameResult;
  onNewGame: () => void;
  onReview: () => void;
};

const resultCopy: Record<GameResult, { eyebrow: string; title: string; message: string }> = {
  win: { eyebrow: 'Game over', title: 'You win!', message: 'Great game. Review the key moments with Stockfish.' },
  loss: { eyebrow: 'Game over', title: 'Echo wins', message: 'Every loss contains clues for your next game.' },
  draw: { eyebrow: 'Game over', title: 'Draw', message: 'A balanced battle. See where the advantage changed.' },
};

export function GameEndOverlay({ result, onNewGame, onReview }: GameEndOverlayProps) {
  const copy = resultCopy[result];
  return (
    <div aria-labelledby="game-result-title" aria-modal="true" className="game-end-overlay" role="dialog">
      <div className="game-end-card">
        <span>{copy.eyebrow}</span>
        <h2 id="game-result-title">{copy.title}</h2>
        <p>{copy.message}</p>
        <div>
          <button onClick={onNewGame}>New game</button>
          <button className="game-end-card__review" onClick={onReview}>Review</button>
        </div>
      </div>
    </div>
  );
}
