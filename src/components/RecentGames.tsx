import type { SavedGameRecord } from '../lib/gameHistory';

type RecentGamesProps = { games: SavedGameRecord[]; onOpen: (game: SavedGameRecord) => void };

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(new Date(value));
}

export function RecentGames({ games, onOpen }: RecentGamesProps) {
  return (
    <section className="recent-games">
      <div className="recent-games__heading">
        <div><span>Case archive</span><h2>Recent games</h2></div><b>{games.length} saved</b>
      </div>
      {games.length === 0 ? (
        <p className="recent-games__empty">Finish a game against Echo to save its move review here.</p>
      ) : (
        <div className="recent-games__list">
          {games.map((game, index) => (
            <button key={game.id} onClick={() => onOpen(game)} type="button">
              <span><b>Case {String(index + 1).padStart(3, '0')}</b><small>{formatDate(game.createdAt)}</small></span>
              <span><b>{game.entries.length - 1} moves</b><small>You played {game.playerColor === 'w' ? 'White' : 'Black'}</small></span>
              <span className="recent-games__ratings"><i>{game.brilliantCount} brilliant</i><em>{game.blunderCount} blunders</em></span>
              <strong aria-hidden="true">→</strong>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
