import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";

type View = "main" | "join";

export default function Lobby() {
  const { myUsername, findMatch, createRoom, joinRoom, fetchLeaderboard, isConnected, createdMatchId, clearCreatedMatch, error } =
    useGameStore();
  const [view, setView] = useState<View>("main");
  const [joinId, setJoinId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = async (action: () => Promise<void>, key: string) => {
    setLoading(key);
    await action();
    setLoading(null);
  };

  const handleCopy = () => {
    if (!createdMatchId) return;
    navigator.clipboard.writeText(createdMatchId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center mb-12"
      >
        {/* Floating X and O */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="font-game text-5xl font-black text-x"
            style={{ textShadow: "0 0 30px rgba(255,61,113,0.8)" }}
          >
            X
          </motion.span>
          <div className="w-px h-10 bg-surface-border" />
          <motion.span
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.25 }}
            className="font-game text-5xl font-black text-o"
            style={{ textShadow: "0 0 30px rgba(0,212,255,0.8)" }}
          >
            O
          </motion.span>
        </div>

        <h1 className="font-game text-3xl md:text-4xl font-black text-white mb-2 tracking-wider">
          TIC TAC TOE
        </h1>
        <p className="text-zinc-500 text-sm tracking-widest uppercase font-body">
          Real-time multiplayer
        </p>

        {myUsername && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4 text-zinc-400 text-sm font-body"
          >
            Welcome,{" "}
            <span className="text-primary-light font-semibold">{myUsername}</span>
          </motion.p>
        )}
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-sm bg-surface-card border border-surface-border rounded-2xl p-6 shadow-2xl"
      >
        {/* Created room share banner */}
        <AnimatePresence>
          {createdMatchId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 bg-primary/10 border border-primary/30 rounded-xl p-4"
            >
              <p className="text-xs text-zinc-400 mb-2 uppercase tracking-widest">Room created — share this ID</p>
              <p className="font-mono text-xs text-primary-light break-all mb-3">
                {createdMatchId}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="flex-1 py-2 text-xs rounded-lg bg-primary/20 border border-primary/40 text-primary-light hover:bg-primary/30 transition-colors"
                >
                  {copied ? "✓ Copied!" : "Copy ID"}
                </button>
                <button
  onClick={() => joinRoom(createdMatchId)}
  className="flex-1 py-2 text-xs rounded-lg bg-green-500/20 border border-green-500/40 text-green-300"
>
  Join Game
</button>
                <button
                  onClick={clearCreatedMatch}
                  className="px-3 py-2 text-xs rounded-lg bg-surface hover:bg-surface-hover border border-surface-border text-zinc-500 transition-colors"
                >
                  ✕
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === "main" ? (
            <motion.div
              key="main"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="flex flex-col gap-3"
            >
              {/* Quick match */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handle(findMatch, "quick")}
                disabled={!isConnected || loading !== null}
                className="relative w-full py-4 rounded-xl font-game text-sm font-bold tracking-wider text-white overflow-hidden transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                  boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                }}
              >
                {loading === "quick" ? (
                  <Spinner />
                ) : (
                  <>
                    <span className="relative z-10">⚡ QUICK MATCH</span>
                    <motion.div
                      className="absolute inset-0 bg-white/10"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 0.5 }}
                    />
                  </>
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-surface-border" />
                <span className="text-xs text-zinc-600 uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-surface-border" />
              </div>

              {/* Create room */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handle(createRoom, "create")}
                disabled={!isConnected || loading !== null}
                className="w-full py-3 rounded-xl font-game text-xs font-bold tracking-wider border border-primary/40 text-primary-light hover:bg-primary/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading === "create" ? <Spinner /> : "＋ CREATE ROOM"}
              </motion.button>

              {/* Join room */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setView("join");
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
                disabled={!isConnected || loading !== null}
                className="w-full py-3 rounded-xl font-game text-xs font-bold tracking-wider border border-surface-border text-zinc-400 hover:border-zinc-500 hover:text-zinc-300 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                → JOIN ROOM
              </motion.button>

              {/* Leaderboard link */}
              <button
                onClick={() => handle(fetchLeaderboard, "lb")}
                disabled={!isConnected || loading !== null}
                className="mt-1 text-xs text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-40 py-1"
              >
                {loading === "lb" ? "Loading..." : "🏆 Leaderboard"}
              </button>

              {!isConnected && (
                <p className="text-center text-xs text-zinc-600 mt-1">
                  Connecting to server…
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="join"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col gap-3"
            >
              <div className="flex items-center gap-2 mb-2">
                <button onClick={() => setView("main")} className="text-zinc-500 hover:text-zinc-300 text-sm">
                  ←
                </button>
                <span className="font-game text-xs text-zinc-400 tracking-widest">JOIN ROOM</span>
              </div>
              <input
                ref={inputRef}
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
                placeholder="Paste room ID here…"
                className="w-full px-4 py-3 rounded-xl bg-surface border border-surface-border text-sm text-white placeholder-zinc-600 outline-none focus:border-primary/60 transition-colors font-mono"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && joinId.trim()) {
                    handle(() => joinRoom(joinId.trim()), "join");
                  }
                }}
              />
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => joinId.trim() && handle(() => joinRoom(joinId.trim()), "join")}
                disabled={!joinId.trim() || loading !== null}
                className="w-full py-3 rounded-xl font-game text-xs font-bold tracking-wider text-white transition-all disabled:opacity-40"
                style={{ background: "linear-gradient(135deg, #6366f1, #4f46e5)" }}
              >
                {loading === "join" ? <Spinner /> : "JOIN →"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/20"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.02, 0.05, 0.02] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-x/20"
        />
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}
