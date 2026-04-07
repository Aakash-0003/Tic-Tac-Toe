// ─── Broadcast helpers ────────────────────────────────────────────────────────

function broadcastStateUpdate(
  dispatcher: nkruntime.MatchDispatcher,
  state: GameState,
): void {
  dispatcher.broadcastMessage(
    OPCODES.STATE_UPDATE,
    JSON.stringify({
      board: state.board,
      currentTurn: state.currentTurn,
      phase: state.phase,
      playerX: state.playerX,
      playerO: state.playerO,
    }),
    null,
    null,
    true, // reliable
  );
}

function broadcastGameOver(
  dispatcher: nkruntime.MatchDispatcher,
  state: GameState,
  reason: string,
): void {
  dispatcher.broadcastMessage(
    OPCODES.GAME_OVER,
    JSON.stringify({
      board: state.board,
      winner: state.winner,
      isDraw: state.isDraw,
      reason: reason,
      playerX: state.playerX,
      playerO: state.playerO,
    }),
    null,
    null,
    true,
  );
}
