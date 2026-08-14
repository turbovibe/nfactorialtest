import { useMemo, useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { ToolNav } from '../components/ToolNav';
import { ChessBoard } from '../components/ChessBoard';
import { ColorSelector } from '../components/ColorSelector';
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
import { useMoveCommentary } from '../lib/useMoveCommentary';

const initialGame = new Chess();
const initialTimeline: TimelineEntry[] = [{
  fen: initialGame.fen(), move: 'Start', actor: 'Start', explanation: startExplanation,
}];

function gameMessage(game: Chess, isThinking: boolean, playerColor: Color): string {
  if (game.isCheckmate()) return game.turn() === playerColor ? 'Echo wins — rewind and investigate.' : 'You checkmated Echo!';
  if (game.isDraw()) return 'Draw. A perfectly balanced mystery.';
  if (game.inCheck()) return game.turn() === playerColor ? 'Your king is in check.' : 'Echo is in check.';
  if (isThinking) return 'Echo is adapting…';
  return game.turn() === playerColor ? 'Your move' : 'Echo’s move';
}

export function GamePage() {
  const [fen, setFen] = useState(initialGame.fen());
  const [selected, setSelected] = useState<Square>();
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
  const [viewIndex, setViewIndex] = useState(0);
  const [elo, setElo] = useState(1200);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const { commentary, isCommenting, commentOnMove, resetCommentary } = useMoveCommentary();
  const game = useMemo(() => new Chess(fen), [fen]);
  const { isThinking, engineStatus, resetEngineStatus } = useRivalTurn({
    game, profile, elo, playerColor, setFen, setTimeline, setViewIndex,
  });
  const isPresent = viewIndex === timeline.length - 1;
  const viewedFen = timeline[viewIndex]?.fen ?? fen;

  const targets = useMemo(() => {
    if (!selected || !isPresent) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, isPresent, selected]);

  function playFrom(square: Square) {
    if (!isPresent || isThinking || game.turn() !== playerColor || game.isGameOver()) return;
    const piece = game.get(square);
    if (!selected) {
      if (piece?.color === playerColor) setSelected(square);
      return;
    }

    playMove(selected, square);
  }

  function playMove(from: Square, to: Square) {
    if (!isPresent || isThinking || game.turn() !== playerColor || game.isGameOver()) return;
    const before = new Chess(game.fen());
    const legalMove = before.moves({ square: from, verbose: true })
      .find((move) => move.to === to && (!move.promotion || move.promotion === 'q'));
    setSelected(undefined);
    if (!legalMove) {
      if (game.get(to)?.color === playerColor) setSelected(to);
      return;
    }

    const next = new Chess(game.fen());
    const played = next.move(legalMove.san);
    void commentOnMove(before, played, next);
    const clue = investigateMove(before, played) ?? undefined;
    const entry: TimelineEntry = {
      fen: next.fen(), move: played.san, actor: 'You',
      explanation: explainPlayerMove(played), clue,
    };
    setProfile((currentProfile) => updateProfile(currentProfile, played));
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
    resetCommentary();
  }

  function chooseColor(color: Color) {
    if (color === playerColor) return;
    setPlayerColor(color);
    resetGame();
  }

  return (
    <main className="game-page">
      <ToolNav />
      <div className="game-toolbar">
        <span>Game 01 · You play {playerColor === 'w' ? 'white' : 'black'}</span>
        <ColorSelector value={playerColor} onChange={chooseColor} />
        <button onClick={resetGame}>New game</button>
      </div>

      <div className="game-layout">
        <section className="board-area">
          <div className="player-row"><span className="player-avatar">Y</span><div><b>You</b><small>{gameMessage(game, isThinking, playerColor)}</small></div></div>
          <ChessBoard
            fen={viewedFen}
            selected={selected}
            targets={targets}
            interactive={isPresent && !isThinking}
            playerColor={playerColor}
            onSquareClick={playFrom}
            onMove={playMove}
          />
        </section>
        <div className="game-sidebar">
          <RivalPanel
            profile={profile}
            isThinking={isThinking}
            commentary={commentary}
            isCommenting={isCommenting}
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
