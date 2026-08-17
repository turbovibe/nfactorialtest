import { useState } from 'react';
import { Chess, type Move } from 'chess.js';

function localComment(move: Move, after: Chess): string {
  const queenCapture = after.moves({ verbose: true }).find((reply) => reply.captured === 'q');
  if (move.san.includes('#')) {
    return 'Checkmate — excellent finish. You found a move that leaves the king with no escape.';
  }
  if (queenCapture) {
    return `Careful: after ${move.san}, your queen can be captured by ${queenCapture.san}. Check every forcing reply before moving.`;
  }
  if (move.captured === 'q') {
    return `Great find: ${move.san} wins the queen. Keep scanning checks and captures first.`;
  }
  if (move.san.includes('+')) {
    return `${move.san} creates a forcing check. Now inspect every legal reply before continuing the attack.`;
  }
  if (move.captured) {
    return `${move.san} changes the material balance. Check whether the captured piece was defended.`;
  }
  return `${move.san} develops your plan. Before the next move, scan checks, captures, and direct threats.`;
}

export function useMoveCommentary() {
  const [commentary, setCommentary] = useState('Make a move and I’ll give you a useful clue.');

  function commentOnMove(_before: Chess, move: Move, after: Chess) {
    setCommentary(localComment(move, after));
  }

  function resetCommentary() {
    setCommentary('Make a move and I’ll give you a useful clue.');
  }

  return { commentary, isCommenting: false, commentOnMove, resetCommentary };
}
