import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { Chess, type Color } from 'chess.js';
import type { TimelineEntry } from './gameTimeline';
import { chooseRivalMove, type PlayerProfile } from './chessRival';
import { findStockfishMove, type EngineStatus } from './stockfishEngine';

type RivalTurnOptions = {
  game: Chess;
  profile: PlayerProfile;
  elo: number;
  playerColor: Color;
  stopped: boolean;
  setFen: Dispatch<SetStateAction<string>>;
  setTimeline: Dispatch<SetStateAction<TimelineEntry[]>>;
  setViewIndex: Dispatch<SetStateAction<number>>;
};

export function useRivalTurn(options: RivalTurnOptions) {
  const { game, profile, elo, playerColor, stopped, setFen, setTimeline, setViewIndex } = options;
  const eloRef = useRef(elo);
  const [isThinking, setIsThinking] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');

  useEffect(() => {
    eloRef.current = elo;
  }, [elo]);

  useEffect(() => {
    if (stopped || game.turn() === playerColor || game.isGameOver()) {
      setIsThinking(false);
      return;
    }
    let cancelled = false;
    setIsThinking(true);
    const timer = window.setTimeout(async () => {
      const next = new Chess(game.fen());
      const legalMoves = next.moves({ verbose: true });
      setEngineStatus('loading');
      const engineMove = await findStockfishMove(next.fen(), eloRef.current).catch(() => null);
      if (cancelled) return;
      setEngineStatus(engineMove ? 'ready' : 'fallback');
      const rivalMove = engineMove
        ? legalMoves.find((move) => `${move.from}${move.to}${move.promotion ?? ''}` === engineMove)
          ?? chooseRivalMove(next, profile)
        : chooseRivalMove(next, profile);
      if (rivalMove) {
        const played = next.move(rivalMove.san);
        setFen(next.fen());
        setTimeline((current) => {
          const entry: TimelineEntry = {
            fen: next.fen(), move: played.san,
          };
          const updated = [...current, entry];
          setViewIndex(updated.length - 1);
          return updated;
        });
      }
      setIsThinking(false);
    }, 650);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [game, playerColor, profile, setFen, setTimeline, setViewIndex, stopped]);

  return {
    isThinking,
    engineStatus,
    resetEngineStatus: () => setEngineStatus('idle'),
  };
}
