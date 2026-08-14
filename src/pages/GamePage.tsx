import { useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { ToolNav } from '../components/ToolNav';
import { ChessBoard } from '../components/ChessBoard';
import { RivalPanel } from '../components/RivalPanel';
import { TimeMachine, type TimelineEntry } from '../components/TimeMachine';
import {
  emptyProfile,
  investigateMove,
  updateProfile,
  type PlayerProfile,
} from '../lib/chessRival';
import { explainPlayerMove, startExplanation } from '../lib/moveExplanation';
import { useRivalTurn } from '../lib/useRivalTurn';

const initialGame = new Chess();
const initialTimeline: TimelineEntry[] = [{
  fen: initialGame.fen(), move: 'Start', actor: 'Start', explanation: startExplanation,
}];

function gameMessage(game: Chess, isThinking: boolean): string {
  if (game.isCheckmate()) return game.turn() === 'w' ? 'Echo wins — rewind and investigate.' : 'You checkmated Echo!';
  if (game.isDraw()) return 'Draw. A perfectly balanced mystery.';
  if (game.inCheck()) return game.turn() === 'w' ? 'Your king is in check.' : 'Echo is in check.';
  if (isThinking) return 'Echo is adapting…';
  return game.turn() === 'w' ? 'Your move' : 'Echo’s move';
}

export function GamePage() {
  const [fen, setFen] = useState(initialGame.fen());
  const [selected, setSelected] = useState<Square>();
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
  const [viewIndex, setViewIndex] = useState(0);
  const [elo, setElo] = useState(1200);
  const game = useMemo(() => new Chess(fen), [fen]);
  const { isThinking, engineStatus, resetEngineStatus } = useRivalTurn({
    game, profile, elo, setFen, setTimeline, setViewIndex,
  });
  const isPresent = viewIndex === timeline.length - 1;
  const viewedFen = timeline[viewIndex]?.fen ?? fen;

  const targets = useMemo(() => {
    if (!selected || !isPresent) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, isPresent, selected]);

  function playFrom(square: Square) {
    if (!isPresent || isThinking || game.turn() !== 'w' || game.isGameOver()) return;
    const piece = game.get(square);
    if (!selected) {
      if (piece?.color === 'w') setSelected(square);
      return;
    }

    playMove(selected, square);
  }

  function playMove(from: Square, to: Square) {
    if (!isPresent || isThinking || game.turn() !== 'w' || game.isGameOver()) return;
    const before = new Chess(game.fen());
    const legalMove = before.moves({ square: from, verbose: true })
      .find((move) => move.to === to && (!move.promotion || move.promotion === 'q'));
    setSelected(undefined);
    if (!legalMove) {
      if (game.get(to)?.color === 'w') setSelected(to);
      return;
    }

    const next = new Chess(game.fen());
    const played = next.move(legalMove.san);
    const clue = investigateMove(before, played) ?? undefined;
    const newProfile = updateProfile(profile, played);
    const entry: TimelineEntry = {
      fen: next.fen(), move: played.san, actor: 'You',
      explanation: explainPlayerMove(played), clue,
    };
    setProfile(newProfile);
    setFen(next.fen());
    setTimeline((current) => {
      const updated = [...current, entry];
      setViewIndex(updated.length - 1);
      return updated;
    });
  }

  function resetGame() {
    const fresh = new Chess();
    setFen(fresh.fen());
    setSelected(undefined);
    setProfile(emptyProfile);
    setTimeline([{ fen: fresh.fen(), move: 'Start', actor: 'Start', explanation: startExplanation }]);
    setViewIndex(0);
    resetEngineStatus();
  }

  return (
    <main className="game-page">
      <ToolNav />
      <div className="game-toolbar"><span>Game 01 · You play white</span><button onClick={resetGame}>New game</button></div>

      <div className="game-layout">
        <section className="board-area">
          <div className="player-row"><span className="player-avatar">Y</span><div><b>You</b><small>{gameMessage(game, isThinking)}</small></div></div>
          <ChessBoard
            fen={viewedFen}
            selected={selected}
            targets={targets}
            interactive={isPresent && !isThinking}
            onSquareClick={playFrom}
            onMove={playMove}
          />
        </section>
        <div className="game-sidebar">
          <RivalPanel
            profile={profile}
            isThinking={isThinking}
            elo={elo}
            engineStatus={engineStatus}
            onEloChange={setElo}
          />
          <TimeMachine entries={timeline} activeIndex={viewIndex} onSelect={(index) => { setSelected(undefined); setViewIndex(index); }} />
        </div>
      </div>
    </main>
  );
}
