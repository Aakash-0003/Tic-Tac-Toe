// ─── Matchmaker callback ──────────────────────────────────────────────────────

function matchmakerMatched(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  matches: nkruntime.MatchmakerResult[],
): string | void {
  const matchId = nk.matchCreate(MATCH_HANDLER_NAME, {});
  logger.info("Matchmaker created match: %s for %d players", matchId, matches.length);
  return matchId;
}
