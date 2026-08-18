import type { Color } from 'chess.js';
import type { MoveRating } from './moveRating';

export type TimelineEntry = {
  fen: string;
  move: string;
  rating?: MoveRating;
  evaluationCp?: number;
  bestMove?: string;
};

export type SavedGame = {
  entries: TimelineEntry[];
  playerColor: Color;
};

const latestGameKey = 'mirror-move-latest-game';

export function cleanMoveSan(move: string): string {
  return move.replace(/^(?:…|\.\.\.)\s*/u, '');
}

export function saveLatestGame(game: SavedGame) {
  try {
    localStorage.setItem(latestGameKey, JSON.stringify(game));
  } catch {
    // The game remains playable when private browsing blocks local storage.
  }
}

export function loadLatestGame(): SavedGame | null {
  try {
    const saved = localStorage.getItem(latestGameKey);
    if (!saved) return null;
    const game = JSON.parse(saved) as SavedGame;
    if (!Array.isArray(game.entries) || !['w', 'b'].includes(game.playerColor)) return null;
    if (!game.entries.every((entry) => typeof entry.fen === 'string' && typeof entry.move === 'string')) return null;
    return {
      ...game,
      entries: game.entries.map((entry) => ({
        ...entry,
        move: cleanMoveSan(entry.move),
      })),
    };
  } catch {
    return null;
  }
}
