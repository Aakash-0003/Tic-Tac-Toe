//Game logic
function createInitialState(): GameState {
  return {
    board: [0, 0, 0, 0, 0, 0, 0, 0, 0],
    playerX: null,
    playerO: null,
    currentTurn: null,
    phase: "waiting",
    winner: null,
    isDraw: false,
    turnStartedAt: 0,
    turnTimeLimit: TURN_TIME_LIMIT,
  };
}

function checkWinner(board: number[]): number | "draw" | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return board[a]; // 1 or 2
    }
  }
  return board.every((cell) => cell !== 0) ? "draw" : null;
}

function validateMove(state: GameState, playerId: string, cellIndex: number): MoveValidation {
  if (state.phase !== "playing") return { valid: false, reason: "Game is not active" };
  if (state.currentTurn !== playerId) return { valid: false, reason: "Not your turn" };
  if (typeof cellIndex !== "number" || cellIndex < 0 || cellIndex > 8) return { valid: false, reason: "Cell index out of range" };
  if (state.board[cellIndex] !== 0) return { valid: false, reason: "Cell already occupied" };
  return { valid: true, reason: null };
}

function applyMove(state: GameState, playerId: string, cellIndex: number): GameState {
  const symbol = playerId === state.playerX ? 1 : 2;
  const newBoard = state.board.slice();
  newBoard[cellIndex] = symbol;

  const result = checkWinner(newBoard);
  let newPhase: GameState["phase"] = state.phase;
  let newWinner = state.winner;
  let newIsDraw = state.isDraw;
  let newTurn = state.currentTurn;

  if (result === "draw") {
    newPhase = "game_over";
    newIsDraw = true;
  } else if (result === 1 || result === 2) {
    newPhase = "game_over";
    newWinner = playerId;
  } else {
    newTurn = playerId === state.playerX ? state.playerO : state.playerX;
  }

  return {
    board: newBoard,
    playerX: state.playerX,
    playerO: state.playerO,
    currentTurn: newTurn,
    phase: newPhase,
    winner: newWinner,
    isDraw: newIsDraw,
    turnStartedAt: state.turnStartedAt,
    turnTimeLimit: state.turnTimeLimit,
  };
}
