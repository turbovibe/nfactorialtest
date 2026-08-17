import { Chess } from 'chess.js';
import type { TimelineEntry } from './gameTimeline';
import { StockfishEngine, type EngineAnalysis } from './stockfishEngine';
import type { MoveRating } from './moveRating';

export type GameReview = {
  depth: number;
  ratings: MoveRating[];
  evaluations: number[];
  bestMoves: (string | undefined)[];
};

function terminalScore(fen: string): number | null {
  const position = new Chess(fen);
  if (position.isCheckmate()) return -100_000;
  if (position.isDraw()) return 0;
  return null;
}

function playedUci(fen: string, move: string): string | null {
  const position = new Chess(fen);
  const played = position.move(move);
  return played ? `${played.from}${played.to}${played.promotion ?? ''}` : null;
}

function bestMoveSan(fen: string, uci: string | null): string | undefined {
  if (!uci) return undefined;
  const position = new Chess(fen);
  const move = position.move({ from: uci.slice(0, 2), to: uci.slice(2, 4), promotion: uci[4] });
  return move?.san;
}

function ratingForLoss(loss: number, move: string, isBest: boolean): MoveRating {
  if (move.includes('#') || (isBest && loss <= 10 && (move.includes('x') || move.includes('+')))) return 'brilliant';
  if (loss <= 25) return 'good';
  if (loss <= 80) return 'fine';
  if (loss <= 180) return 'inaccuracy';
  return 'blunder';
}

export function adaptiveReviewDepth(totalPlies: number): number {
  const cores = navigator.hardwareConcurrency ?? 4;
  const gameDepth = totalPlies <= 24 ? 15 : totalPlies <= 60 ? 13 : 11;
  const deviceAdjustment = cores >= 8 ? 1 : cores <= 4 ? -1 : 0;
  return Math.max(10, Math.min(16, gameDepth + deviceAdjustment));
}

export async function reviewGame(
  entries: TimelineEntry[],
  onProgress: (completed: number) => void,
  signal: AbortSignal,
): Promise<GameReview> {
  const depth = adaptiveReviewDepth(entries.length - 1);
  const engine = new StockfishEngine();
  const analyses: EngineAnalysis[] = [];

  try {
    for (let index = 0; index < entries.length; index += 1) {
      if (signal.aborted) throw new DOMException('Review cancelled', 'AbortError');
      const score = terminalScore(entries[index].fen);
      analyses.push(score === null
        ? await engine.analyze(entries[index].fen, depth)
        : { bestMove: null, scoreCp: score, depth });
      onProgress(index + 1);
    }
  } finally {
    engine.terminate();
  }

  const ratings = entries.slice(1).map((entry, index) => {
    const best = analyses[index].scoreCp;
    const after = analyses[index + 1].scoreCp;
    if (best === null || after === null) throw new Error('Stockfish returned no evaluation');
    const isBest = playedUci(entries[index].fen, entry.move) === analyses[index].bestMove;
    return ratingForLoss(Math.max(0, best + after), entry.move, isBest);
  });
  const evaluations = analyses.map((analysis, index) => {
    const score = analysis.scoreCp ?? 0;
    return new Chess(entries[index].fen).turn() === 'w' ? score : -score;
  });
  const bestMoves = entries.slice(0, -1).map((entry, index) => bestMoveSan(entry.fen, analyses[index].bestMove));
  return { depth, ratings, evaluations, bestMoves };
}
