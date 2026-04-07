import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export default function Matchmaking() {
  const { cancelMatchmaking } = useGameStore();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-10">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border border-primary/30"
            animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.65,
              ease: "easeOut",
            }}
            style={{ width: 80, height: 80 }}
          />
        ))}
        {/* Center X vs O */}
        <div className="relative z-10 w-20 h-20 rounded-full bg-surface-card border border-surface-border flex items-center justify-center">
          <span className="font-game text-2xl font-black">
            <span className="text-x">X</span>
            <span className="text-zinc-600 text-base mx-0.5">·</span>
            <span className="text-o">O</span>
          </span>
        </div>
      </div>

      <div className="text-center">
        <motion.h2
          animate={{ opacity: [1, 0.5, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="font-game text-xl font-bold text-white tracking-wider mb-3"
        >
          FINDING OPPONENT
        </motion.h2>
        <p className="text-zinc-500 text-sm font-body">
          Searching for a worthy challenger…
        </p>
      </div>

      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={cancelMatchmaking}
        className="px-8 py-3 rounded-xl border border-surface-border text-zinc-400 hover:border-rose-500/50 hover:text-rose-400 text-sm font-game tracking-wider transition-all"
      >
        CANCEL
      </motion.button>
    </div>
  );
}
