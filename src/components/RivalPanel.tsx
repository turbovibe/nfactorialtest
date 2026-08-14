import type { PlayerProfile } from '../lib/chessRival';
import { adaptationSummary, profileLabel, rivalThought, styleConfidence } from '../lib/chessRival';
import { EloSelector } from './EloSelector';
import type { EngineStatus } from '../lib/stockfishEngine';

type RivalPanelProps = {
  profile: PlayerProfile;
  isThinking: boolean;
  elo: number;
  engineStatus: EngineStatus;
  onEloChange: (elo: number) => void;
};

export function RivalPanel({ profile, isThinking, elo, engineStatus, onEloChange }: RivalPanelProps) {
  const confidence = styleConfidence(profile);

  return (
    <aside className="rival-panel">
      <div className="rival-heading">
        <div className="rival-avatar">♞</div>
        <div><span>Your adaptive rival</span><h2>Echo</h2></div>
        <i className={isThinking ? 'thinking-pulse' : ''} />
      </div>
      <blockquote>“{isThinking ? 'Let me rethink this position…' : rivalThought(profile)}”</blockquote>
      <EloSelector
        elo={elo}
        disabled={isThinking}
        engineStatus={engineStatus}
        onChange={onEloChange}
      />
      <div className="reading">
        <div className="reading__label"><span>Reading your style</span><strong>{confidence}%</strong></div>
        <div className="meter"><span style={{ width: `${confidence}%` }} /></div>
        <p><strong>{profileLabel(profile)}</strong><span>{adaptationSummary(profile)}</span></p>
      </div>
    </aside>
  );
}
