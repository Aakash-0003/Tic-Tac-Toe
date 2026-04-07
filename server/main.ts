function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer): void {
  // Leaderboard: safe to re-create on every restart (no-op if already exists)
  nk.leaderboardCreate(LEADERBOARD_ID, false, "descending", "incr", null, {});

  initializer.registerMatch(MATCH_HANDLER_NAME, {
    matchInit: matchInit,
    matchJoinAttempt: matchJoinAttempt,
    matchJoin: matchJoin,
    matchLoop: matchLoop,
    matchLeave: matchLeave,
    matchTerminate: matchTerminate,
    matchSignal: matchSignal,
  });

  initializer.registerMatchmakerMatched(matchmakerMatched);
  initializer.registerRpc("create_match", createAuthoritativeMatch);
  initializer.registerRpc("get_leaderboard", getLeaderboard);

  logger.info("Tic-tac-toe v2.0.0 loaded");
}
