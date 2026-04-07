export type Screen = "lobby" | "matchmaking" | "game" | "leaderboard";
export type Phase = "waiting" | "playing" | "game_over";
export type PlayerSymbol = "X" | "O";

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  wins: number;
}

export interface GameState {
  board: number[];
  playerX: string | null;
  playerO: string | null;
  currentTurn: string | null;
  phase: Phase;
  winner: string | null;
  isDraw: boolean;
  gameOverReason: string | null;
}

// Nakama wire payloads
export interface StateUpdatePayload {
  board: number[];
  currentTurn: string | null;
  phase: Phase;
  playerX: string | null;
  playerO: string | null;
}

export interface GameOverPayload {
  board: number[];
  winner: string | null;
  isDraw: boolean;
  reason: string;
  playerX: string | null;
  playerO: string | null;
}

export interface TimerPayload {
  remaining: number;
}
