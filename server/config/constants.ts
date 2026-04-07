const WINNING_LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // columns
  [0, 4, 8],
  [2, 4, 6], // diagonals
];

const OPCODES = {
  MOVE: 1, // client → server: { cellIndex: number }
  STATE_UPDATE: 2, // server → client: full board state
  GAME_OVER: 3, // server → client: result + reason
  ERROR: 4, // server → client: validation error
  TIMER_UPDATE: 5, // server → client: remaining seconds (unreliable)
} as const;

const TURN_TIME_LIMIT = 30;
const LEADERBOARD_ID = "global_wins";
const MATCH_HANDLER_NAME = "tic_tac_toe";
