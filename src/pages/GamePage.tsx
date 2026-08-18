import { useEffect, useMemo, useState } from 'react';
import { Chess, type Color, type Square } from 'chess.js';
import { useLocation } from 'wouter';
import { ToolNav } from '../components/ToolNav';
import { GameBoardArea } from '../components/GameBoardArea';
import { GameToolbar } from '../components/GameToolbar';
import { RivalPanel } from '../components/RivalPanel';
import { TimeMachine } from '../components/TimeMachine';
import { saveLatestGame, type TimelineEntry } from '../lib/gameTimeline';
import { findMoveSquares } from '../lib/moveSquares';
import {
  emptyProfile,
  updateProfile,
  type PlayerProfile,
} from '../lib/chessRival';
import { useRivalTurn } from '../lib/useRivalTurn';
import { useMoveCommentary } from '../lib/useMoveCommentary';
import { useGameReview } from '../lib/useGameReview';
import { useGameEndOverlay } from '../lib/useGameEndOverlay';

const initialGame = new Chess();
const initialTimeline: TimelineEntry[] = [{
  fen: initialGame.fen(), move: 'Start',
}];

export function GamePage() {
  const [fen, setFen] = useState(initialGame.fen());
  const [selected, setSelected] = useState<Square>();
  const [profile, setProfile] = useState<PlayerProfile>(emptyProfile);
  const [timeline, setTimeline] = useState<TimelineEntry[]>(initialTimeline);
  const [viewIndex, setViewIndex] = useState(0);
  const [elo, setElo] = useState(1200);
  const [playerColor, setPlayerColor] = useState<Color>('w');
  const [resigned, setResigned] = useState(false);
  const [, navigate] = useLocation();
  const { commentary, isCommenting, commentOnMove, resetCommentary } = useMoveCommentary();
  const game = useMemo(() => new Chess(fen), [fen]);
  const isGameOver = resigned || game.isGameOver();
  const { isOpen: showEndOverlay, closeOverlay } = useGameEndOverlay(isGameOver);
  const { isThinking, engineStatus, resetEngineStatus } = useRivalTurn({
    game, profile, elo, playerColor, stopped: resigned, setFen, setTimeline, setViewIndex,
  });
  const { reviewedEntries, status: reviewStatus, progress: reviewProgress, depth: reviewDepth } = useGameReview(
    timeline, isGameOver,
  );
  const isPresent = viewIndex === timeline.length - 1;
  const viewedFen = timeline[viewIndex]?.fen ?? fen;
  const lastMove = useMemo(() => findMoveSquares(timeline, viewIndex), [timeline, viewIndex]);

  useEffect(() => {
    saveLatestGame({ entries: timeline, playerColor });
  }, [playerColor, timeline]);

  const targets = useMemo(() => {
    if (!selected || !isPresent) return [];
    return game.moves({ square: selected, verbose: true }).map((move) => move.to);
  }, [game, isPresent, selected]);

  function playFrom(square: Square) {
    if (!isPresent || isThinking || isGameOver || game.turn() !== playerColor) return;
    const piece = game.get(square);
    if (!selected) {
      if (piece?.color === playerColor) setSelected(square);
      return;
    }

    playMove(selected, square);
  }

  function playMove(from: Square, to: Square) {
    if (!isPresent || isThinking || isGameOver || game.turn() !== playerColor) return;
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
    const entry: TimelineEntry = {
      fen: next.fen(), move: played.san,
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
    setResigned(false);
    closeOverlay();
    setTimeline([{ fen: fresh.fen(), move: 'Start' }]);
    setViewIndex(0);
    resetEngineStatus();
    resetCommentary();
  }

  function chooseColor(color: Color) {
    if (color === playerColor) return;
    setPlayerColor(color);
    resetGame();
  }

  function resignGame() {
    if (isGameOver) return;
    setSelected(undefined);
    setResigned(true);
  }

  return (
    <main className="game-page">
      <ToolNav />
      <GameToolbar
        playerColor={playerColor}
        canResign={!isGameOver}
        onColorChange={chooseColor}
        onResign={resignGame}
        onNewGame={resetGame}
      />

      <div className="game-layout">
        <GameBoardArea
          game={game}
          fen={viewedFen}
          lastMove={lastMove}
          lastMoveRating={reviewedEntries[viewIndex]?.rating}
          selected={selected}
          targets={targets}
          playerColor={playerColor}
          isThinking={isThinking}
          isGameOver={isGameOver || !isPresent}
          resigned={resigned}
          showEndOverlay={showEndOverlay}
          onSquareClick={playFrom}
          onMove={playMove}
          onNewGame={resetGame}
          onReview={() => navigate('/time-machine')}
        />
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
          <TimeMachine
            entries={reviewedEntries}
            activeIndex={viewIndex}
            isGameOver={isGameOver}
            reviewStatus={reviewStatus}
            reviewProgress={reviewProgress}
            reviewDepth={reviewDepth}
            onSelect={(index) => { setSelected(undefined); setViewIndex(index); }}
          />
        </div>
      </div>
    </main>
  );
}
