import { useMemo, useState } from 'react';
import { Chess } from 'chess.js';
import { ChessBoard } from './ChessBoard';

const choices = [
  {
    move: 'e4',
    label: '1. e4',
    style: 'The Instigator',
    prediction: 'You want the center now and questions later. Expect sharp lines and early pressure.',
  },
  {
    move: 'd4',
    label: '1. d4',
    style: 'The Architect',
    prediction: 'You prefer to build control before striking. Your attacks usually arrive with a plan.',
  },
  {
    move: 'Nf3',
    label: '1. Nf3',
    style: 'The Observer',
    prediction: 'You keep your options open and wait for clues. Flexibility is part of your strategy.',
  },
];

export function MovePredictionHook() {
  const [selectedMove, setSelectedMove] = useState<string>();
  const selected = choices.find((choice) => choice.move === selectedMove);
  const fen = useMemo(() => {
    const game = new Chess();
    if (selectedMove) game.move(selectedMove);
    return game.fen();
  }, [selectedMove]);

  return (
    <section className="prediction-hook" aria-labelledby="prediction-title">
      <div className="prediction-hook__board">
        <ChessBoard fen={fen} playerColor="w" />
      </div>
      <div className="prediction-hook__copy">
        <p className="eyebrow">Echo is already watching</p>
        <h2 id="prediction-title">Your first move says more than you think.</h2>
        <p>Choose how you would open. Echo will make its first prediction about your playing style.</p>
        <div className="prediction-choices" aria-label="Choose your first move">
          {choices.map((choice) => (
            <button
              className={selectedMove === choice.move ? 'prediction-choice prediction-choice--active' : 'prediction-choice'}
              key={choice.move}
              onClick={() => setSelectedMove(choice.move)}
              type="button"
            >
              {choice.label}
            </button>
          ))}
        </div>
        <div className={selected ? 'prediction-result prediction-result--visible' : 'prediction-result'} aria-live="polite">
          <span>{selected ? 'Echo predicts' : 'Waiting for your move'}</span>
          <h3>{selected?.style ?? 'Choose an opening above'}</h3>
          <p>{selected?.prediction ?? 'There is no wrong answer. Every choice gives Echo a new clue.'}</p>
        </div>
      </div>
    </section>
  );
}
