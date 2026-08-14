import type { CSSProperties } from 'react';
import type { EngineStatus } from '../lib/stockfishEngine';

type EloSelectorProps = {
  elo: number;
  disabled: boolean;
  engineStatus: EngineStatus;
  onChange: (elo: number) => void;
};

const statusText: Record<EngineStatus, string> = {
  idle: 'Stockfish starts after your move',
  loading: 'Stockfish is calculating…',
  ready: 'Stockfish 18 active',
  fallback: 'Backup bot active',
};

export function EloSelector({ elo, disabled, engineStatus, onChange }: EloSelectorProps) {
  const progress = ((elo - 100) / 3100) * 100;

  return (
    <div className="elo-selector">
      <div className="elo-selector__heading">
        <label htmlFor="elo-level">Opponent strength</label>
        <strong>{elo} Elo</strong>
      </div>
      <input
        id="elo-level"
        type="range"
        min="100"
        max="3200"
        step="100"
        value={elo}
        disabled={disabled}
        style={{ '--elo-progress': `${progress}%` } as CSSProperties}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="elo-selector__scale"><span>100</span><span>3200</span></div>
      <small className={`engine-status engine-status--${engineStatus}`}>{statusText[engineStatus]}</small>
    </div>
  );
}
