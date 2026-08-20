import type { Chess, Color } from 'chess.js';
import type { GameResult } from '../components/GameEndOverlay';

export function getGameResult(game: Chess, playerColor: Color, resigned: boolean): GameResult | null {
  if (resigned) return 'loss';
  if (game.isCheckmate()) return game.turn() === playerColor ? 'loss' : 'win';
  if (game.isDraw()) return 'draw';
  return null;
}

export function getGameMessage(game: Chess, isThinking: boolean, playerColor: Color, resigned: boolean): string {
  if (resigned) return 'You resigned — Miro wins. Review the game and try again.';
  if (game.isCheckmate()) return game.turn() === playerColor ? 'Miro wins — rewind and investigate.' : 'You checkmated Miro!';
  if (game.isDraw()) return 'Draw. A perfectly balanced mystery.';
  if (game.inCheck()) return game.turn() === playerColor ? 'Your king is in check.' : 'Miro is in check.';
  if (isThinking) return 'Miro is adapting…';
  return game.turn() === playerColor ? 'Your move' : 'Miro’s move';
}
