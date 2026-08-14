import { useRef, useState } from 'react';
import { Chess, type Move } from 'chess.js';
import { supabase } from './supabase';

const systemPrompt = `You are Echo, a warm but honest chess coach for a teenager.
Comment on the player's latest move in no more than 45 words and two sentences.
Start with what was good, inaccurate, or dangerous, then give one concrete next-time tip.
Only call a move a blunder when the supplied position proves a serious loss.
Use plain English, no markdown, no engine scores, and never insult the player.`;

function fallbackComment(move: Move, after: Chess): string {
  const queenCapture = after.moves({ verbose: true }).find((reply) => reply.captured === 'q');
  if (move.san.includes('#')) return 'Checkmate — excellent finish. You found a move that leaves the king with no escape.';
  if (queenCapture) return `Careful: after ${move.san}, your queen can be captured by ${queenCapture.san}. Before moving, check every capture and threat your opponent has.`;
  if (move.captured === 'q') return `Great find: ${move.san} wins the queen. Keep scanning checks and captures before considering quieter moves.`;
  if (move.san.includes('+')) return `${move.san} creates a forcing check. Now look at every legal reply so your attack does not run out of momentum.`;
  if (move.captured) return `${move.san} changes the material balance. Check whether the captured piece was defended before deciding the trade is complete.`;
  return `${move.san} is part of your plan. Before the next move, scan your opponent's checks, captures, and direct threats.`;
}

function promptForMove(before: Chess, move: Move, after: Chess): string {
  const replies = after.moves({ verbose: true });
  const captures = replies.filter((reply) => reply.captured).map((reply) => reply.san);
  return [
    `Position before: ${before.fen()}`,
    `Player move: ${move.san} (${move.from}-${move.to})`,
    `Position after: ${after.fen()}`,
    `Opponent legal replies: ${replies.map((reply) => reply.san).join(', ')}`,
    `Opponent captures: ${captures.join(', ') || 'none'}`,
  ].join('\n');
}

function cleanComment(text: string): string {
  return text.trim().replace(/^['"“]+|['"”]+$/g, '').slice(0, 360);
}

async function requestAiComment(before: Chess, move: Move, after: Chess): Promise<string> {
  let timeoutId = 0;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = window.setTimeout(() => reject(new Error('AI commentary timed out')), 8_000);
  });

  try {
    const { data, error } = await Promise.race([
      supabase.functions.invoke('ai', {
        body: { prompt: promptForMove(before, move, after), system: systemPrompt },
      }),
      timeout,
    ]);
    return !error && typeof data?.text === 'string' ? cleanComment(data.text) : '';
  } catch {
    return '';
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export function useMoveCommentary() {
  const [commentary, setCommentary] = useState('Make a move and I’ll give you a useful clue.');
  const [isCommenting, setIsCommenting] = useState(false);
  const requestId = useRef(0);

  async function commentOnMove(before: Chess, move: Move, after: Chess) {
    const currentId = ++requestId.current;
    const fallback = fallbackComment(move, after);
    setCommentary(`Reviewing ${move.san}…`);
    setIsCommenting(true);

    const text = await requestAiComment(before, move, after);
    if (currentId !== requestId.current) return;

    setCommentary(text || fallback);
    setIsCommenting(false);
  }

  function resetCommentary() {
    requestId.current += 1;
    setCommentary('Make a move and I’ll give you a useful clue.');
    setIsCommenting(false);
  }

  return { commentary, isCommenting, commentOnMove, resetCommentary };
}
