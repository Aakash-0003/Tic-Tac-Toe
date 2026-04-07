// ─── Leaderboard operations ───────────────────────────────────────────────────

function recordWin(
  nk: nkruntime.Nakama,
  logger: nkruntime.Logger,
  winnerId: string,
): void {
  try {
    nk.leaderboardRecordWrite(LEADERBOARD_ID, winnerId, "", 1, 0, {});
    logger.info("Leaderboard updated for winner: %s", winnerId);
  } catch (e) {
    logger.error("Failed to update leaderboard for %s: %s", winnerId, e);
  }
}
