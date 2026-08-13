import { Chess, type Move } from 'chess.js';

export type PlayerProfile = {
  moves: number;
  captures: number;
  pawnMoves: number;
  queenMoves: number;
};

export const emptyProfile: PlayerProfile = {
  moves: 0,
  captures: 0,
  pawnMoves: 0,
  queenMoves: 0,
};

const pieceValue: Record<string, number> = {
  p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0,
};

const centralSquares = new Set(['d4', 'e4', 'd5', 'e5']);

function moveScore(game: Chess, move: Move): number {
  let score = move.captured ? pieceValue[move.captured] * 2 : 0;
  score += centralSquares.has(move.to) ? 0.7 : 0;
  score += move.promotion ? pieceValue[move.promotion] : 0;

  const next = new Chess(game.fen());
  next.move(move.san);
  if (next.inCheck()) score += 0.8;
  if (next.isCheckmate()) score += 100;
  return score;
}

export function updateProfile(profile: PlayerProfile, move: Move): PlayerProfile {
  return {
    moves: profile.moves + 1,
    captures: profile.captures + (move.captured ? 1 : 0),
    pawnMoves: profile.pawnMoves + (move.piece === 'p' ? 1 : 0),
    queenMoves: profile.queenMoves + (move.piece === 'q' ? 1 : 0),
  };
}

export function profileLabel(profile: PlayerProfile): string {
  if (profile.moves < 2) return 'Reading your opening…';
  if (profile.queenMoves > 1) return 'Early queen explorer';
  if (profile.captures / profile.moves > 0.35) return 'Tactical hunter';
  if (profile.pawnMoves / profile.moves > 0.65) return 'Patient builder';
  return 'Balanced explorer';
}

export function rivalThought(profile: PlayerProfile): string {
  if (profile.moves < 2) return 'Show me how you think.';
  if (profile.queenMoves > 1) return 'Your queen likes adventure. I noticed.';
  if (profile.captures / profile.moves > 0.35) return 'You chase trades. I’ll make them costly.';
  if (profile.pawnMoves / profile.moves > 0.65) return 'A careful structure. Let’s put it under pressure.';
  return 'You keep your options open. So will I.';
}

export function chooseRivalMove(game: Chess, profile: PlayerProfile): Move | null {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;

  const ranked = moves.map((move) => {
    let score = moveScore(game, move);
    if (profile.queenMoves > 1 && move.piece === 'n') score += 0.35;
    if (profile.captures > 1 && !move.captured) score += 0.2;
    score += Math.random() * 0.35;
    return { move, score };
  });
  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].move;
}

export function investigateMove(game: Chess, chosen: Move): string | null {
  const moves = game.moves({ verbose: true });
  const best = Math.max(...moves.map((move) => moveScore(game, move)));
  const chosenScore = moveScore(game, chosen);
  if (best - chosenScore < 1.5) return null;
  if (moves.some((move) => move.captured === 'q')) return 'A queen was available. Which piece could reach it?';
  if (moves.some((move) => move.captured === 'r')) return 'There was a loose rook in this position. Trace every attack.';
  return 'A forcing move was hiding here. Look for checks and captures first.';
}
