import {
  STOCKFISH_MAX_ELO,
  STOCKFISH_MIN_ELO,
  type EngineStatus,
} from '../lib/stockfishEngine';

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

function strengthLabel(elo: number): string {
  if (elo === STOCKFISH_MIN_ELO) return 'Training';
  if (elo < 1400) return 'Developing';
  if (elo < 1600) return 'Intermediate';
  if (elo < 1800) return 'Strong';
  if (elo < 2000) return 'Advanced';
  if (elo < 2200) return 'Expert';
  if (elo < 2400) return 'Master';
  if (elo < STOCKFISH_MAX_ELO) return 'Elite';
  return 'Maximum';
}

export function EloSelector({ elo, engineStatus, onChange }: EloSelectorProps) {
  const progress = ((elo - STOCKFISH_MIN_ELO) / (STOCKFISH_MAX_ELO - STOCKFISH_MIN_ELO)) * 100;
  const label = strengthLabel(elo);

  function changeElo(event: React.ChangeEvent<HTMLInputElement>) {
    onChange(event.currentTarget.valueAsNumber);
  }

  return (
    <div className="elo-selector">
      <div className="elo-selector__heading">
        <label htmlFor="elo-level">Opponent strength</label>
        <strong>{elo} Elo · {label}</strong>
      </div>
      <div className="elo-slider">
        <div className="elo-slider__fill" style={{ width: `${progress}%` }} />
        <div className="elo-slider__thumb" style={{ left: `${progress}%` }} />
        <input
          id="elo-level"
          type="range"
          min={STOCKFISH_MIN_ELO}
          max={STOCKFISH_MAX_ELO}
          step="10"
          value={elo}
          onChange={changeElo}
          aria-valuetext={`${elo} Elo, ${label}`}
        />
      </div>
      <div className="elo-selector__scale"><span>{STOCKFISH_MIN_ELO}</span><span>{STOCKFISH_MAX_ELO}</span></div>
      <small className="elo-selector__note">1300 training · above 1300 no strength handicap · 3200 maximum</small>
      <small className={`engine-status engine-status--${engineStatus}`}>{statusText[engineStatus]}</small>
    </div>
  );
}
