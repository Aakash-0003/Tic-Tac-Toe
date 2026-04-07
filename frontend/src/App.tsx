import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGameStore } from "./store/gameStore";
import Lobby from "./components/Lobby";
import Matchmaking from "./components/Matchmaking";
import Game from "./components/Game";
import Leaderboard from "./components/Leaderboard";

const screenVariants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function App() {
  const { screen, error, setError, init, isConnected } = useGameStore();

  useEffect(() => {
    init();
  }, [init]);

  // Auto-dismiss errors after 4 s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(null), 4000);
    return () => clearTimeout(t);
  }, [error, setError]);

  return (
    <div className="relative min-h-screen bg-[#07070f] bg-grid bg-spotlight overflow-hidden">
      {/* Connection indicator */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full transition-colors duration-500 ${
            isConnected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "bg-zinc-600"
          }`}
        />
        <span className="text-xs text-zinc-500 font-body">
          {isConnected ? "online" : "offline"}
        </span>
      </div>

      {/* Error toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: -20, x: "-50%" }}
            className="fixed top-4 left-1/2 z-50 bg-rose-500/10 border border-rose-500/40 text-rose-300 text-sm px-4 py-3 rounded-xl backdrop-blur-sm max-w-sm text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screens */}
      <AnimatePresence mode="wait">
        {screen === "lobby" && (
          <motion.div key="lobby" {...screenVariants}>
            <Lobby />
          </motion.div>
        )}
        {screen === "matchmaking" && (
          <motion.div key="matchmaking" {...screenVariants}>
            <Matchmaking />
          </motion.div>
        )}
        {screen === "game" && (
          <motion.div key="game" {...screenVariants}>
            <Game />
          </motion.div>
        )}
        {screen === "leaderboard" && (
          <motion.div key="leaderboard" {...screenVariants}>
            <Leaderboard />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
