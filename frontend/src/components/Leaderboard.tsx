import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

const medals = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { leaderboard, setScreen, myUserId } = useGameStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => setScreen("lobby")}
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm font-game tracking-wider"
          >
            ← BACK
          </button>
          <h1 className="font-game text-xl font-bold text-white tracking-wider">
            LEADERBOARD
          </h1>
          <span className="text-2xl">🏆</span>
        </div>

        {/* Table */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          {leaderboard.length === 0 ? (
            <div className="py-16 text-center text-zinc-600 text-sm font-body">
              No records yet — play some matches!
            </div>
          ) : (
            leaderboard.map((entry, i) => (
              <motion.div
                key={entry.userId}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`flex items-center gap-4 px-5 py-4 border-b border-surface-border last:border-0 transition-colors ${
                  entry.userId === myUserId ? "bg-primary/5" : "hover:bg-surface-hover"
                }`}
              >
                {/* Rank */}
                <span className="text-lg w-8 text-center flex-shrink-0">
                  {i < 3 ? medals[i] : <span className="text-zinc-600 text-sm font-mono">{i + 1}</span>}
                </span>

                {/* Username */}
                <div className="flex-1 min-w-0">
                  <p
                    className="font-body text-sm font-semibold truncate"
                    style={{ color: entry.userId === myUserId ? "#818cf8" : "#f0f0ff" }}
                  >
                    {entry.username}
                    {entry.userId === myUserId && (
                      <span className="ml-2 text-[10px] text-primary-light/60 uppercase tracking-widest">you</span>
                    )}
                  </p>
                </div>

                {/* Wins */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className="font-game text-lg font-bold"
                    style={{ color: i === 0 ? "#fbbf24" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "#f0f0ff" }}
                  >
                    {entry.wins}
                  </span>
                  <span className="text-xs text-zinc-600 font-body">
                    {entry.wins === 1 ? "win" : "wins"}
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Play button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setScreen("lobby")}
          className="w-full mt-6 py-3 rounded-xl font-game text-sm font-bold tracking-wider text-white"
          style={{
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
          }}
        >
          ⚡ PLAY NOW
        </motion.button>
      </motion.div>
    </div>
  );
}
