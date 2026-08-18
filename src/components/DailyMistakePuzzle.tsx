import { useMemo, useRef, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { createDailyPuzzle, puzzleSignature } from '../lib/dailyPuzzles';
import { ChessBoard } from './ChessBoard';

type Feedback = { correct: boolean; text: string };

export function DailyMistakePuzzle() {
  const seenPuzzles = useRef(new Set<string>());
  const [puzzle, setPuzzle] = useState(() => {
    const firstPuzzle = createDailyPuzzle(seenPuzzles.current);
    seenPuzzles.current.add(puzzleSignature(firstPuzzle.fen));
    return firstPuzzle;
  });
  const [puzzleNumber, setPuzzleNumber] = useState(1);
  const [selected, setSelected] = useState<Square>();
  const [solvedFen, setSolvedFen] = useState<string>();
  const [feedback, setFeedback] = useState<Feedback>();
  const game = useMemo(() => new Chess(puzzle.fen), [puzzle.fen]);
  const targets = useMemo(() => selected
    ? game.moves({ square: selected, verbose: true }).map((move) => move.to)
    : [], [game, selected]);

  function selectSquare(square: Square) {
    if (solvedFen) return;
    const piece = game.get(square);
    if (!selected) {
      if (piece?.color === puzzle.color) setSelected(square);
      return;
    }
    playMove(selected, square);
  }

  function playMove(from: Square, to: Square) {
    if (solvedFen) return;
    const legalMove = game.moves({ square: from, verbose: true })
      .find((move) => move.to === to && (!move.promotion || move.promotion === 'q'));
    setSelected(undefined);
    if (!legalMove) {
      if (game.get(to)?.color === puzzle.color) setSelected(to);
      return;
    }
    const isCorrect = from === puzzle.solution.from && to === puzzle.solution.to;
    if (!isCorrect) {
      setFeedback({ correct: false, text: 'That move is legal, but it misses the tactic. Try another move.' });
      return;
    }
    const solvedGame = new Chess(puzzle.fen);
    solvedGame.move(legalMove);
    setSolvedFen(solvedGame.fen());
    setFeedback({ correct: true, text: puzzle.success });
  }

  function showNextPuzzle() {
    const nextPuzzle = createDailyPuzzle(seenPuzzles.current);
    seenPuzzles.current.add(puzzleSignature(nextPuzzle.fen));
    setPuzzle(nextPuzzle);
    setPuzzleNumber((current) => current + 1);
    setSelected(undefined);
    setSolvedFen(undefined);
    setFeedback(undefined);
  }

  return (
    <div className="daily-puzzle">
      <section className="daily-puzzle__board">
        <div className="daily-puzzle__toolbar">
          <span>{puzzle.color === 'w' ? 'White' : 'Black'} to move</span>
          <span>Puzzle {puzzleNumber}</span>
        </div>
        <ChessBoard
          fen={solvedFen ?? puzzle.fen}
          interactive={!solvedFen}
          playerColor={puzzle.color}
          selected={selected}
          targets={targets}
          onMove={playMove}
          onSquareClick={selectSquare}
        />
      </section>

      <aside className="daily-puzzle__case">
        <span>Case {String(puzzleNumber).padStart(3, '0')} · Board challenge</span>
        <h2>{puzzle.title}</h2>
        <p>{puzzle.hint}</p>
        <p className="daily-puzzle__instruction">
          Move a piece on the board by dragging it or selecting its destination.
        </p>
        {feedback && (
          <div className={feedback.correct ? 'daily-feedback daily-feedback--correct' : 'daily-feedback'} aria-live="polite">
            <strong>{feedback.correct ? 'Case solved.' : 'Not the winning move yet.'}</strong>
            <p>{feedback.text}</p>
          </div>
        )}
        {feedback?.correct && (
          <button className="daily-next" onClick={showNextPuzzle} type="button">
            Next puzzle
            <span aria-hidden="true">→</span>
          </button>
        )}
      </aside>
    </div>
  );
}
