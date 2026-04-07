function matchInit(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  params: { [key: string]: string },
): { state: nkruntime.MatchState; tickRate: number; label: string } {
  const state = createInitialState();
  logger.info("Match initialised: %s", ctx.matchId);
  return { state: state, tickRate: 1, label: MATCH_HANDLER_NAME };
}

function matchJoinAttempt(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presence: nkruntime.Presence,
  metadata: { [key: string]: any },
): { state: nkruntime.MatchState; accept: boolean; rejectMessage?: string } | null {
  if (state.playerX !== null && state.playerO !== null) {
    logger.warn("Match %s is full — rejecting %s", ctx.matchId, presence.userId);
    return { state: state, accept: false, rejectMessage: "Match is full" };
  }
  return { state: state, accept: true };
}

function matchJoin(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[],
): { state: nkruntime.MatchState } | null {
  for (const presence of presences) {
    if (state.playerX === presence.userId || state.playerO === presence.userId) {
      logger.info("Already assigned, skipping: %s", presence.userId);
      continue;
    }
    if (state.playerX === null) {
      state.playerX = presence.userId;
      logger.info("PlayerX assigned: %s", presence.userId);
    } else if (state.playerO === null) {
      state.playerO = presence.userId;
      logger.info("PlayerO assigned: %s", presence.userId);
    }
  }

  if (state.playerX !== null && state.playerO !== null && state.phase === "waiting") {
    state.phase = "playing";
    state.currentTurn = state.playerX;
    state.turnStartedAt = tick;
    broadcastStateUpdate(dispatcher, state);
    logger.info("Match %s started — X:%s O:%s", ctx.matchId, state.playerX, state.playerO);
  }

  return { state: state };
}

function matchLoop(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  messages: nkruntime.MatchMessage[],
): { state: nkruntime.MatchState } | null {
  if (state.phase === "waiting") return { state: state };

  if (state.phase === "playing") {
    const elapsed = tick - state.turnStartedAt;
    const remaining = state.turnTimeLimit - elapsed;

    if (remaining <= 0) {
      const timedOut = state.currentTurn;
      state.winner = timedOut === state.playerX ? state.playerO : state.playerX;
      state.phase = "game_over";
      if (state.winner) recordWin(nk, logger, state.winner);
      broadcastGameOver(dispatcher, state, "timeout");
      logger.info("Match %s — %s timed out, %s wins", ctx.matchId, timedOut, state.winner);
      return null;
    }

    // Unreliable timer tick — clients tolerate drops
    dispatcher.broadcastMessage(OPCODES.TIMER_UPDATE, JSON.stringify({ remaining: remaining }), null, null, false);
  }

  for (const message of messages) {
    const senderId = message.sender.userId;

    if (message.opCode !== OPCODES.MOVE) {
      logger.warn("Unexpected opcode %d from %s", message.opCode, senderId);
      continue;
    }

    let payload: MovePayload;
    try {
      payload = JSON.parse(nk.binaryToString(message.data));
    } catch (e) {
      logger.error("Unparseable move payload from %s", senderId);
      continue;
    }

    const validation = validateMove(state, senderId, payload.cellIndex);
    if (!validation.valid) {
      dispatcher.broadcastMessage(OPCODES.ERROR, JSON.stringify({ reason: validation.reason }), [message.sender], null, true);
      logger.warn("Invalid move — player:%s reason:%s", senderId, validation.reason);
      continue;
    }

    const newState = applyMove(state, senderId, payload.cellIndex);
    Object.assign(state, newState);
    state.turnStartedAt = tick;
    logger.info("Move — player:%s cell:%d phase:%s", senderId, payload.cellIndex, state.phase);

    if (state.phase === "game_over") {
      if (state.winner) recordWin(nk, logger, state.winner);
      broadcastGameOver(dispatcher, state, "normal");
      logger.info("Match %s ended — winner:%s draw:%s", ctx.matchId, state.winner, state.isDraw);
      return null;
    }

    broadcastStateUpdate(dispatcher, state);
  }

  return { state: state };
}

function matchLeave(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  presences: nkruntime.Presence[],
): { state: nkruntime.MatchState } | null {
  for (const presence of presences) {
    logger.info("Player left: %s from match %s", presence.userId, ctx.matchId);

    if (state.phase === "playing") {
      const winner = presence.userId === state.playerX ? state.playerO : state.playerX;
      if (!winner) {
        logger.warn("Cannot determine winner after disconnect in %s", ctx.matchId);
        return null;
      }
      state.phase = "game_over";
      state.winner = winner;
      recordWin(nk, logger, winner);
      broadcastGameOver(dispatcher, state, "opponent_disconnected");
      logger.info("Match %s — %s won by opponent disconnect", ctx.matchId, winner);
      return null;
    }
  }

  return { state: state };
}

function matchTerminate(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  graceSeconds: number,
): { state: nkruntime.MatchState } | null {
  logger.info("Match %s terminating — grace: %ds", ctx.matchId, graceSeconds);
  broadcastGameOver(dispatcher, state, "server_shutdown");
  return null;
}

function matchSignal(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  dispatcher: nkruntime.MatchDispatcher,
  tick: number,
  state: nkruntime.MatchState,
  data: string,
): { state: nkruntime.MatchState; data: string } | null {
  return { state: state, data: "" };
}
