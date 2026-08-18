import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ChessBoard } from '../components/ChessBoard';
import { ReviewInsight } from '../components/ReviewInsight';
import { ReviewMoveList } from '../components/ReviewMoveList';
import { ReviewSummary } from '../components/ReviewSummary';
import { ToolNav } from '../components/ToolNav';
import { loadLatestGame } from '../lib/gameTimeline';
import { findMoveSquares } from '../lib/moveSquares';
import { useGameReview } from '../lib/useGameReview';

export function TimeMachinePage() {
  const game = useMemo(loadLatestGame, []);
  const entries = useMemo(() => game?.entries ?? [], [game]);
  const [activeIndex, setActiveIndex] = useState(Math.max(0, entries.length - 1));
  const { reviewedEntries, status, progress, depth } = useGameReview(entries, entries.length > 1);
  const activeEntry = reviewedEntries[activeIndex];
  const lastMove = useMemo(() => findMoveSquares(entries, activeIndex), [activeIndex, entries]);

  function changeMove(nextIndex: number) {
    setActiveIndex(Math.max(0, Math.min(reviewedEntries.length - 1, nextIndex)));
  }

  return (
    <main className="review-page">
      <ToolNav />
      <header className="review-title">
        <div><p className="eyebrow">Stockfish 18 review</p><h1>Time Machine</h1></div>
        {reviewedEntries.length > 1 && <span>{reviewedEntries.length - 1} moves</span>}
      </header>

      {reviewedEntries.length <= 1 ? (
        <section className="review-empty">
          <span>⌛</span><h2>No game to rewind yet</h2>
          <p>Play a few moves against Echo, then come back here for a full review.</p>
          <Link href="/game">Play a game</Link>
        </section>
      ) : (
        <div className="review-layout">
          <section className="review-board-panel">
            <div className="review-board-toolbar">
              <button disabled={activeIndex === 0} onClick={() => changeMove(activeIndex - 1)} type="button">← Previous</button>
              <strong>{activeIndex === 0 ? 'Start' : `${Math.ceil(activeIndex / 2)}${activeIndex % 2 ? '.' : '…'} ${activeEntry?.move}`}</strong>
              <button disabled={activeIndex === reviewedEntries.length - 1} onClick={() => changeMove(activeIndex + 1)} type="button">Next →</button>
            </div>
            <ChessBoard
              fen={activeEntry?.fen ?? reviewedEntries[0].fen}
              lastMove={lastMove}
              lastMoveRating={activeEntry?.rating}
              playerColor={game?.playerColor ?? 'w'}
            />
            <ReviewInsight entry={activeEntry} index={activeIndex} depth={depth} />
          </section>

          <aside className="review-sidebar">
            <div className="review-sidebar__title"><div><span>Game review</span><h2>Move timeline</h2></div><b>SF 18</b></div>
            {(status === 'analyzing' || status === 'idle') && (
              <div className="review-loading">
                <span style={{ width: `${(progress / reviewedEntries.length) * 100}%` }} />
                <p>Analyzing position {progress} of {reviewedEntries.length} · depth {depth}</p>
              </div>
            )}
            {status === 'error' && <p className="review-error">Stockfish could not finish this review. Refresh to try again.</p>}
            <ReviewMoveList entries={reviewedEntries} activeIndex={activeIndex} onSelect={changeMove} />
            {status === 'ready' && <ReviewSummary entries={reviewedEntries} />}
          </aside>
        </div>
      )}
    </main>
  );
}
