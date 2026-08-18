import type { GameStats } from '../lib/gameHistory';

export function DetectiveStats({ stats }: { stats: GameStats }) {
  const items = [
    { label: 'Games reviewed', value: stats.games, tone: 'neutral' },
    { label: 'Brilliant moves', value: stats.brilliantMoves, tone: 'brilliant' },
    { label: 'Blunders found', value: stats.blunders, tone: 'blunder' },
  ];

  return (
    <section className="detective-stats" aria-label="Your game statistics">
      {items.map((item) => (
        <article className={`detective-stat detective-stat--${item.tone}`} key={item.label}>
          <strong>{item.value}</strong><span>{item.label}</span>
        </article>
      ))}
    </section>
  );
}
