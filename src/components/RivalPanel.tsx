import type { PlayerProfile } from '../lib/chessRival';
import { profileLabel, rivalThought } from '../lib/chessRival';

type RivalPanelProps = {
  profile: PlayerProfile;
  isThinking: boolean;
};

export function RivalPanel({ profile, isThinking }: RivalPanelProps) {
  const confidence = Math.min(92, 18 + profile.moves * 12);

  return (
    <aside className="rival-panel">
      <div className="rival-heading">
        <div className="rival-avatar">♞</div>
        <div><span>Your adaptive rival</span><h2>Echo</h2></div>
        <i className={isThinking ? 'thinking-pulse' : ''} />
      </div>
      <blockquote>“{isThinking ? 'Let me rethink this position…' : rivalThought(profile)}”</blockquote>
      <div className="reading">
        <div className="reading__label"><span>Reading your style</span><strong>{confidence}%</strong></div>
        <div className="meter"><span style={{ width: `${confidence}%` }} /></div>
        <p>{profileLabel(profile)}</p>
      </div>
    </aside>
  );
}
