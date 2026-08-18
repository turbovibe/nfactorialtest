import type { Color } from 'chess.js';
import type { TimelineEntry } from './gameTimeline';
import { supabase } from './supabase';

export type SavedGameRecord = {
  id: string;
  playerColor: Color;
  entries: TimelineEntry[];
  brilliantCount: number;
  blunderCount: number;
  createdAt: string;
};

export type GameStats = { games: number; brilliantMoves: number; blunders: number };

type SavedGameRow = {
  id: string;
  player_color: Color;
  entries: TimelineEntry[];
  brilliant_count: number;
  blunder_count: number;
  created_at: string;
};

function countRating(entries: TimelineEntry[], rating: 'brilliant' | 'blunder') {
  return entries.filter((entry) => entry.rating === rating).length;
}

export async function saveCompletedGame(sessionId: string, playerColor: Color, entries: TimelineEntry[]) {
  const { error } = await supabase.from('saved_games').upsert({
    session_id: sessionId,
    player_color: playerColor,
    entries,
    brilliant_count: countRating(entries, 'brilliant'),
    blunder_count: countRating(entries, 'blunder'),
  }, { onConflict: 'user_id,session_id' });
  if (error) throw error;
}

function toSavedGame(row: SavedGameRow): SavedGameRecord {
  return {
    id: row.id,
    playerColor: row.player_color,
    entries: row.entries,
    brilliantCount: row.brilliant_count,
    blunderCount: row.blunder_count,
    createdAt: row.created_at,
  };
}

export async function loadGameHistory() {
  const [recentResult, statsResult] = await Promise.all([
    supabase.from('saved_games')
      .select('id, player_color, entries, brilliant_count, blunder_count, created_at')
      .order('created_at', { ascending: false }).limit(6),
    supabase.from('saved_games').select('brilliant_count, blunder_count'),
  ]);
  if (recentResult.error) throw recentResult.error;
  if (statsResult.error) throw statsResult.error;

  const recentGames = (recentResult.data as SavedGameRow[]).map(toSavedGame);
  const stats = (statsResult.data ?? []).reduce<GameStats>((total, row) => ({
    games: total.games + 1,
    brilliantMoves: total.brilliantMoves + row.brilliant_count,
    blunders: total.blunders + row.blunder_count,
  }), { games: 0, brilliantMoves: 0, blunders: 0 });
  return { recentGames, stats };
}
