import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { DetectiveStats } from '../components/DetectiveStats';
import { RecentGames } from '../components/RecentGames';
import { ToolNav } from '../components/ToolNav';
import { loadGameHistory, type GameStats, type SavedGameRecord } from '../lib/gameHistory';
import { saveLatestGame } from '../lib/gameTimeline';

export function DetectivePage() {
  const [games, setGames] = useState<SavedGameRecord[]>([]);
  const [stats, setStats] = useState<GameStats>({ games: 0, brilliantMoves: 0, blunders: 0 });
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [, navigate] = useLocation();

  useEffect(() => {
    void loadGameHistory()
      .then((history) => {
        setGames(history.recentGames);
        setStats(history.stats);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  function openGame(game: SavedGameRecord) {
    saveLatestGame({ entries: game.entries, playerColor: game.playerColor });
    navigate('/time-machine');
  }

  return (
    <main className="tools-page">
      <ToolNav />
      <section className="tool-workspace detective-workspace">
        <p className="eyebrow">Tool 03</p><h1>Mistake Detective</h1>
        <p className="workspace-lead">Review your saved games and track the moments that can sharpen your play.</p>
        {status === 'loading' && <p className="history-message">Loading your case archive…</p>}
        {status === 'error' && (
          <p className="history-message history-message--error">The archive is not ready yet. Apply the saved-games migration, then refresh.</p>
        )}
        {status === 'ready' && (
          <><DetectiveStats stats={stats} /><RecentGames games={games} onOpen={openGame} /></>
        )}
        <Link className="detective-play-link" href="/game">Play and review a new game →</Link>
      </section>
    </main>
  );
}
