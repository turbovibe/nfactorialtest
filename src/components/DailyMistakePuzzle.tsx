import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';

const START_FEN = 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4';

const answers = [
  { move: 'Qxf7#', label: 'Qxf7#', correct: true },
  { move: 'Qxe5+', label: 'Qxe5+', correct: false },
  { move: 'Qh4', label: 'Qh4', correct: false },
];

export function DailyMistakePuzzle() {
  const [answer, setAnswer] = useState<(typeof answers)[number]>();
  const position = useMemo(() => {
    if (!answer) return START_FEN;
    const game = new Chess(START_FEN);
    game.move(answer.move);
    return game.fen();
  }, [answer]);

  return (
    <div className="daily-puzzle">
      <section className="daily-puzzle__board">
        <div className="daily-puzzle__toolbar">
          <span>White to move</span>
          {answer && <button onClick={() => setAnswer(undefined)} type="button">Try again</button>}
        </div>
        <ChessBoard fen={position} playerColor="w" />
      </section>

      <aside className="daily-puzzle__case">
        <span>Case 001 · Beginner trap</span>
        <h2>Black attacked your queen with …Nf6. What did they overlook?</h2>
        <p>Find the move that ends the game immediately.</p>
        <div className="daily-puzzle__answers">
          {answers.map((option) => (
            <button
              className={answer?.move === option.move ? 'daily-answer daily-answer--selected' : 'daily-answer'}
              key={option.move}
              onClick={() => setAnswer(option)}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
        {answer && (
          <div className={answer.correct ? 'daily-feedback daily-feedback--correct' : 'daily-feedback'} aria-live="polite">
            <strong>{answer.correct ? 'Case solved.' : 'Not the winning move yet.'}</strong>
            <p>{answer.correct
              ? 'Qxf7 is checkmate. The queen attacks the king while the bishop on c4 protects it.'
              : 'That lets Black survive. Look at the weak f7 pawn and your bishop on c4.'}</p>
          </div>
        )}
      </aside>
    </div>
  );
}
