import { Chess, type Move } from 'chess.js';

export type MoveRating = 'blunder' | 'inaccuracy' | 'book' | 'fine' | 'good' | 'brilliant';

export const ratingLabels: Record<MoveRating, string> = {
  blunder: 'Blunder',
  inaccuracy: 'Inaccuracy',
  book: 'Book move',
  fine: 'Fine',
  good: 'Good',
  brilliant: 'Brilliant',
};

const bookMoves = new Set([
  'e4', 'd4', 'c4', 'Nf3', 'e5', 'c5', 'e6', 'c6', 'd5', 'Nf6', 'Nc6', 'g6', 'b6', 'f5',
]);

function opponentHasMate(after: Chess): boolean {
  return after.moves({ verbose: true }).some((reply) => {
    const position = new Chess(after.fen());
    position.move(reply.san);
    return position.isCheckmate();
  });
}

function isDeveloping(move: Move): boolean {
  return (move.piece === 'n' || move.piece === 'b')
    && (move.from[1] === '1' || move.from[1] === '8');
}

export function rateMove(move: Move, after: Chess, ply: number): MoveRating {
  if (after.isCheckmate()) return 'brilliant';

  const replies = after.moves({ verbose: true });
  if (opponentHasMate(after) || replies.some((reply) => reply.captured === 'q')) return 'blunder';
  if (replies.some((reply) => reply.captured === 'r')) return 'inaccuracy';

  const simpleSan = move.san.replace(/[+#?!]/g, '');
  if (ply <= 10 && bookMoves.has(simpleSan)) return 'book';
  if (move.san.includes('+') || move.captured || move.san.startsWith('O-O') || isDeveloping(move)) return 'good';
  return 'fine';
}
