import { Chess, type Move } from 'chess.js';

export type PlayerProfile = {
  moves: number;
  captures: number;
  checks: number;
  pawnMoves: number;
  queenMoves: number;
  centerMoves: number;
  developmentMoves: number;
  castles: number;
};

export type PlayerStyle = 'learning' | 'tactical' | 'queen' | 'builder' | 'positional' | 'central' | 'balanced';

export const emptyProfile: PlayerProfile = {
  moves: 0, captures: 0, checks: 0, pawnMoves: 0, queenMoves: 0,
  centerMoves: 0, developmentMoves: 0, castles: 0,
};

const pieceValue: Record<string, number> = { p: 1, n: 3, b: 3.2, r: 5, q: 9, k: 0 };
const centralSquares = new Set([
  'c3', 'c4', 'd3', 'd4', 'e3', 'e4', 'f3', 'f4',
  'c5', 'd5', 'e5', 'f5', 'c6', 'd6', 'e6', 'f6',
]);

function isDevelopment(move: Move): boolean {
  return (move.piece === 'n' || move.piece === 'b') && (move.from[1] === '1' || move.from[1] === '8');
}

function moveScore(game: Chess, move: Move, style: PlayerStyle): number {
  let score = move.captured ? pieceValue[move.captured] * 2 : 0;
  score += centralSquares.has(move.to) ? 0.55 : 0;
  score += move.promotion ? pieceValue[move.promotion] : 0;
  score += isDevelopment(move) ? 0.25 : 0;

  const next = new Chess(game.fen());
  next.move(move.san);
  if (next.inCheck()) score += style === 'tactical' ? 1.2 : 0.8;
  if (next.isCheckmate()) return score + 100;
  const replyCapture = Math.max(0, ...next.moves({ verbose: true })
    .map((reply) => reply.captured ? pieceValue[reply.captured] : 0));

  if (style === 'tactical') score += (move.captured ? 0.55 : 0) - replyCapture * 0.12;
  if (style === 'queen') score += move.piece === 'n' || move.piece === 'b' ? 0.5 : 0;
  if (style === 'builder') score += move.captured === 'p' ? 0.65 : centralSquares.has(move.to) ? 0.3 : 0;
  if (style === 'positional') score += isDevelopment(move) || move.san.startsWith('O-O') ? 0.55 : 0;
  if (style === 'central') score += centralSquares.has(move.to) || move.captured === 'p' ? 0.55 : 0;
  if (style === 'balanced') score += replyCapture === 0 ? 0.2 : 0;
  return score;
}

export function updateProfile(profile: PlayerProfile, move: Move): PlayerProfile {
  return {
    moves: profile.moves + 1,
    captures: profile.captures + (move.captured ? 1 : 0),
    checks: profile.checks + (move.san.includes('+') || move.san.includes('#') ? 1 : 0),
    pawnMoves: profile.pawnMoves + (move.piece === 'p' ? 1 : 0),
    queenMoves: profile.queenMoves + (move.piece === 'q' ? 1 : 0),
    centerMoves: profile.centerMoves + (centralSquares.has(move.to) ? 1 : 0),
    developmentMoves: profile.developmentMoves + (isDevelopment(move) ? 1 : 0),
    castles: profile.castles + (move.san.startsWith('O-O') ? 1 : 0),
  };
}

export function playerStyle(profile: PlayerProfile): PlayerStyle {
  if (profile.moves < 2) return 'learning';
  if ((profile.captures + profile.checks) / profile.moves >= 0.34) return 'tactical';
  if (profile.queenMoves >= 2) return 'queen';
  if (profile.castles > 0 || profile.developmentMoves / profile.moves >= 0.5) return 'positional';
  if (profile.pawnMoves / profile.moves >= 0.6) return 'builder';
  if (profile.centerMoves / profile.moves >= 0.5) return 'central';
  return 'balanced';
}

export function profileLabel(profile: PlayerProfile): string {
  const labels: Record<PlayerStyle, string> = {
    learning: 'Watching your first moves', tactical: 'Tactical attacker', queen: 'Early queen explorer',
    builder: 'Patient structure builder', positional: 'Position-first planner',
    central: 'Center controller', balanced: 'Balanced explorer',
  };
  return labels[playerStyle(profile)];
}

export function adaptationSummary(profile: PlayerProfile): string {
  const summaries: Record<PlayerStyle, string> = {
    learning: 'Echo needs two of your moves before choosing a counter-style.',
    tactical: 'Echo now avoids loose pieces and values forcing replies.',
    queen: 'Echo develops minor pieces quickly to challenge your queen.',
    builder: 'Echo attacks your pawn chain and contests central squares.',
    positional: 'Echo fights for development and safe king placement.',
    central: 'Echo challenges your central space before it becomes an attack.',
    balanced: 'Echo keeps flexible moves and reduces easy counterplay.',
  };
  return summaries[playerStyle(profile)];
}

export function styleConfidence(profile: PlayerProfile): number {
  if (profile.moves === 0) return 0;
  return Math.min(94, 20 + profile.moves * 14);
}

export function rivalThought(profile: PlayerProfile): string {
  return profile.moves < 2 ? 'Show me how you think.' : adaptationSummary(profile);
}

export function chooseRivalMove(game: Chess, profile: PlayerProfile): Move | null {
  const moves = game.moves({ verbose: true });
  if (!moves.length) return null;
  const style = playerStyle(profile);
  return moves.map((move) => ({ move, score: moveScore(game, move, style) + Math.random() * 0.12 }))
    .sort((a, b) => b.score - a.score)[0].move;
}

export function investigateMove(game: Chess, chosen: Move): string | null {
  const moves = game.moves({ verbose: true });
  const best = Math.max(...moves.map((move) => moveScore(game, move, 'balanced')));
  if (best - moveScore(game, chosen, 'balanced') < 1.5) return null;
  if (moves.some((move) => move.captured === 'q')) return 'A queen was available. Which piece could reach it?';
  if (moves.some((move) => move.captured === 'r')) return 'There was a loose rook here. Trace every attack.';
  return 'A forcing move was hiding here. Look for checks and captures first.';
}
