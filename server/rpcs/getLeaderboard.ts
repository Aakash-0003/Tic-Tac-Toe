// ─── RPC: fetch top 10 leaderboard entries ────────────────────────────────────

function getLeaderboard(
  ctx: nkruntime.Context,
  logger: nkruntime.Logger,
  nk: nkruntime.Nakama,
  payload: string,
): string {
  try {
    const result = nk.leaderboardRecordsList(LEADERBOARD_ID, [], 10, undefined, null);
    return JSON.stringify({ records: result.records || [] });
  } catch (e) {
    logger.error("Failed to fetch leaderboard: %s", e);
    return JSON.stringify({ records: [] });
  }
}
