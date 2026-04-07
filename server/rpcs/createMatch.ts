// ─── RPC: create an authoritative match ───────────────────────────────────────

function createAuthoritativeMatch(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string,
): string {
  const matchId = nk.matchCreate(MATCH_HANDLER_NAME, {});
  logger.info("RPC created match: %s", matchId);
  return JSON.stringify({ match_id: matchId });
}
