// ─── Server-side game state (lives inside Nakama match) ───────────────────────

interface GameState {
  board: number[];                              // 9 cells: 0=empty 1=X 2=O
  playerX: string | null;                       // user_id of X player
  playerO: string | null;                       // user_id of O player
  currentTurn: string | null;                   // user_id whose turn it is
  phase: "waiting" | "playing" | "game_over";
  winner: string | null;                        // user_id of winner, or null
  isDraw: boolean;
  turnStartedAt: number;                        // tick when current turn began
  turnTimeLimit: number;                        // ticks per turn (matches tickRate)
}

// ─── Wire formats ──────────────────────────────────────────────────────────────

interface MovePayload {
  cellIndex: number;  // 0–8
}

interface MoveValidation {
  valid: boolean;
  reason: string | null;
}
