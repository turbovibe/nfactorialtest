import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';

export type DailyPuzzle = {
  color: Color;
  fen: string;
  hint: string;
  solution: { from: Square; to: Square };
  success: string;
  title: string;
};

type PuzzleTemplate = {
  color: Color;
  fen: string;
  reserved: Square[];
  title: string;
};

const templates: PuzzleTemplate[] = [
  {
    color: 'w', fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    reserved: ['d2', 'd3', 'd4', 'd5', 'd6', 'd7'],
    title: 'The king is trapped behind its own pawns.',
  },
  {
    color: 'b', fen: '3r2k1/5ppp/8/8/8/8/5PPP/6K1 b - - 0 1',
    reserved: ['d2', 'd3', 'd4', 'd5', 'd6', 'd7'],
    title: 'White left the back rank unprotected.',
  },
  {
    color: 'w', fen: '7k/5K1p/8/8/8/8/8/6R1 w - - 0 1',
    reserved: ['g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
    title: 'The enemy king has been pushed into the corner.',
  },
  {
    color: 'b', fen: '6r1/8/8/8/8/8/5k1P/7K b - - 0 1',
    reserved: ['g2', 'g3', 'g4', 'g5', 'g6', 'g7'],
    title: 'The kings are close. Use that to protect the final move.',
  },
  {
    color: 'w', fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    reserved: [], title: 'Black attacked the queen but overlooked the king.',
  },
];

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const squares = Array.from({ length: 64 }, (_, index) => {
  const file = files[index % 8];
  const rank = 8 - Math.floor(index / 8);
  return `${file}${rank}` as Square;
});
const decoyPieces: PieceSymbol[] = ['p', 'n', 'b'];

function randomIndex(length: number) {
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return value[0] % length;
}

function findOnlyMate(game: Chess) {
  return game.moves({ verbose: true }).filter((move) => {
    const next = new Chess(game.fen());
    next.move(move);
    return next.isCheckmate();
  });
}

export function puzzleSignature(fen: string) {
  return fen.split(' ').slice(0, 2).join(' ');
}

export function createDailyPuzzle(seen: ReadonlySet<string>): DailyPuzzle {
  for (;;) {
    const template = templates[randomIndex(templates.length)];
    const game = new Chess(template.fen);
    const available = squares.filter((square) => !game.get(square) && !template.reserved.includes(square));
    const ownPieces = squares.filter((square) => game.get(square)?.color === template.color);
    const maxDecoys = Math.min(8, 16 - ownPieces.length);
    const decoyCount = maxDecoys > 0 ? 1 + randomIndex(maxDecoys) : 0;

    for (let index = 0; index < decoyCount && available.length; index += 1) {
      const squareIndex = randomIndex(available.length);
      const square = available.splice(squareIndex, 1)[0];
      let type = decoyPieces[randomIndex(decoyPieces.length)];
      const pawnCount = squares.filter((boardSquare) => {
        const piece = game.get(boardSquare);
        return piece?.color === template.color && piece.type === 'p';
      }).length;
      if (type === 'p' && pawnCount >= 8) type = 'n';
      if (type === 'p' && (square[1] === '1' || square[1] === '8')) type = 'n';
      game.put({ color: template.color, type }, square);
    }

    const signature = puzzleSignature(game.fen());
    const mates = game.inCheck() ? [] : findOnlyMate(game);
    if (seen.has(signature) || mates.length !== 1) continue;
    const mate = mates[0];
    return {
      color: template.color,
      fen: game.fen(),
      title: template.title,
      hint: 'Find the only move that gives checkmate.',
      solution: { from: mate.from, to: mate.to },
      success: `${mate.san} is checkmate. Great board vision!`,
    };
  }
}
