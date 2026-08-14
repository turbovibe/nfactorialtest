import type { Move } from 'chess.js';
import { adaptationSummary, type PlayerProfile } from './chessRival';

const pieceNames: Record<string, string> = {
  p: 'pawn', n: 'knight', b: 'bishop', r: 'rook', q: 'queen', k: 'king',
};

export const startExplanation = 'The starting position: both sides can fight for the center, develop pieces, and prepare king safety.';

function moveIdea(move: Move): string {
  if (move.san.startsWith('O-O')) return 'Castling moves the king to safety and connects the rooks.';
  if (move.captured) return `The ${pieceNames[move.piece]} captures a ${pieceNames[move.captured]} on ${move.to}, changing the material balance.`;
  if (move.san.includes('#')) return `The ${pieceNames[move.piece]} moves to ${move.to} and delivers checkmate.`;
  if (move.san.includes('+')) return `The ${pieceNames[move.piece]} moves to ${move.to} with check, forcing an immediate response.`;
  if (['d4', 'e4', 'd5', 'e5'].includes(move.to)) return `The ${pieceNames[move.piece]} moves to ${move.to} and claims space in the center.`;
  if ((move.piece === 'n' || move.piece === 'b') && (move.from[1] === '1' || move.from[1] === '8')) {
    return `The ${pieceNames[move.piece]} develops from ${move.from} to ${move.to}, becoming more active.`;
  }
  return `The ${pieceNames[move.piece]} moves from ${move.from} to ${move.to}, improving or changing the position.`;
}

export function explainPlayerMove(move: Move): string {
  return moveIdea(move);
}

export function explainRivalMove(move: Move, profile: PlayerProfile): string {
  return `${moveIdea(move)} ${adaptationSummary(profile)}`;
}
