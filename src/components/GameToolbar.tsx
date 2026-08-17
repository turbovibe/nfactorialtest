import type { Color } from 'chess.js';
import { ColorSelector } from './ColorSelector';

type GameToolbarProps = {
  playerColor: Color;
  canResign: boolean;
  onColorChange: (color: Color) => void;
  onResign: () => void;
  onNewGame: () => void;
};

export function GameToolbar({
  playerColor, canResign, onColorChange, onResign, onNewGame,
}: GameToolbarProps) {
  return (
    <div className="game-toolbar">
      <span>Game 01 · You play {playerColor === 'w' ? 'white' : 'black'}</span>
      <ColorSelector value={playerColor} onChange={onColorChange} />
      <div className="game-toolbar__actions">
        <button className="game-toolbar__resign" disabled={!canResign} onClick={onResign}>Resign</button>
        <button onClick={onNewGame}>New game</button>
      </div>
    </div>
  );
}
