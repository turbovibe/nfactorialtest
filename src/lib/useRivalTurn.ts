import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { Chess } from 'chess.js';
import type { TimelineEntry } from '../components/TimeMachine';
import { chooseRivalMove, type PlayerProfile } from './chessRival';
import { explainRivalMove } from './moveExplanation';
import { findStockfishMove, type EngineStatus } from './stockfishEngine';

type RivalTurnOptions = {
  game: Chess;
  profile: PlayerProfile;
  elo: number;
  setFen: Dispatch<SetStateAction<string>>;
  setTimeline: Dispatch<SetStateAction<TimelineEntry[]>>;
  setViewIndex: Dispatch<SetStateAction<number>>;
};

export function useRivalTurn(options: RivalTurnOptions) {
  const { game, profile, elo, setFen, setTimeline, setViewIndex } = options;
  const [isThinking, setIsThinking] = useState(false);
  const [engineStatus, setEngineStatus] = useState<EngineStatus>('idle');

  useEffect(() => {
    if (game.turn() !== 'b' || game.isGameOver()) return;
    let cancelled = false;
    setIsThinking(true);
    const timer = window.setTimeout(async () => {
      const next = new Chess(game.fen());
      const legalMoves = next.moves({ verbose: true });
      setEngineStatus('loading');
      const engineMove = await findStockfishMove(
        next.fen(), elo, legalMoves.map((move) => `${move.from}${move.to}${move.promotion ?? ''}`),
      ).catch(() => null);
      if (cancelled) return;
      setEngineStatus(engineMove ? 'ready' : 'fallback');
      const rivalMove = engineMove
        ? legalMoves.find((move) => `${move.from}${move.to}${move.promotion ?? ''}` === engineMove)
          ?? chooseRivalMove(next, profile)
        : chooseRivalMove(next, profile);
      if (rivalMove) {
        const played = next.move(rivalMove.san);
        const entry: TimelineEntry = {
          fen: next.fen(), move: `…${played.san}`, actor: 'Echo',
          explanation: explainRivalMove(played, profile),
        };
        setFen(next.fen());
        setTimeline((current) => {
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
  }, [elo, game, profile, setFen, setTimeline, setViewIndex]);

  return {
    isThinking,
    engineStatus,
    resetEngineStatus: () => setEngineStatus('idle'),
  };
}
