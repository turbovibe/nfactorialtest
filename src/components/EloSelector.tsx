import type { EngineStatus } from '../lib/stockfishEngine';

type EloSelectorProps = {
  elo: number;
  engineStatus: EngineStatus;
  onChange: (elo: number) => void;
};

const statusText: Record<EngineStatus, string> = {
  idle: 'Stockfish starts after your move',
  loading: 'Stockfish is calculating…',
  ready: 'Stockfish 18 active',
  fallback: 'Backup bot active',
};

export function EloSelector({ elo, engineStatus, onChange }: EloSelectorProps) {
  const progress = ((elo - 100) / 3100) * 100;

  return (
    <div className="elo-selector">
      <div className="elo-selector__heading">
        <label htmlFor="elo-level">Opponent strength</label>
        <strong>{elo} Elo{elo === 3200 ? ' · Max' : ''}</strong>
      </div>
      <div className="elo-slider">
        <div className="elo-slider__fill" style={{ width: `${progress}%` }} />
        <div className="elo-slider__thumb" style={{ left: `${progress}%` }} />
        <input
          id="elo-level"
          type="range"
          min="100"
          max="3200"
          step="100"
          value={elo}
          onInput={(event) => onChange(Number(event.currentTarget.value))}
          onChange={(event) => onChange(Number(event.currentTarget.value))}
        />
      </div>
      <div className="elo-selector__scale"><span>100</span><span>3200</span></div>
      <small className="elo-selector__note">1320–3190 native range · 3200 uses maximum strength</small>
      <small className={`engine-status engine-status--${engineStatus}`}>{statusText[engineStatus]}</small>
    </div>
  );
}
