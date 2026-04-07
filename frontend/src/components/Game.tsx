import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "../store/gameStore";
import Board from "./Board";

export default function Game() {
  const {
    board, playerX, playerO, currentTurn, phase, winner, isDraw,
    gameOverReason, timer, myUserId, sendMove, backToLobby, findMatch,
  } = useGameStore();

  const mySymbol = playerX === myUserId ? "X" : playerO === myUserId ? "O" : null;
  const isMyTurn = currentTurn === myUserId && phase === "playing";
  const opponentId = mySymbol === "X" ? playerO : playerX;

  const iWon = winner === myUserId;
  const opponentWon = winner !== null && winner !== myUserId;

  // Timer color: green → amber → rose
  const timerColor =
    timer > 15 ? "#10b981" : timer > 8 ? "#f59e0b" : "#ef4444";
  const timerPct = (timer / 30) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 gap-6">
      {/* Player headers */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm flex items-center justify-between"
      >
        <PlayerBadge
          symbol="X"
          isMe={mySymbol === "X"}
          isActive={currentTurn === playerX && phase === "playing"}
          playerId={playerX}
        />

        {/* Timer + VS */}
        <div className="flex flex-col items-center gap-2">
          {phase === "playing" && (
            <motion.div
              animate={timer <= 8 ? { scale: [1, 1.1, 1] } : {}}
              transition={timer <= 8 ? { duration: 0.5, repeat: Infinity } : {}}
              className="font-game text-2xl font-black"
              style={{ color: timerColor, textShadow: `0 0 16px ${timerColor}80` }}
            >
              {timer}
            </motion.div>
          )}
          {phase === "waiting" && (
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-xs text-zinc-500 font-body uppercase tracking-widest"
            >
              waiting…
            </motion.span>
          )}
          {phase === "playing" && (
            <div className="w-16 h-1 bg-surface-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: timerColor }}
                animate={{ width: `${timerPct}%` }}
                transition={{ duration: 0.9, ease: "linear" }}
              />
            </div>
          )}
          {(phase === "game_over" || phase === "waiting") && (
            <span className="text-xs text-zinc-600 font-game tracking-wider">VS</span>
          )}
        </div>

        <PlayerBadge
          symbol="O"
          isMe={mySymbol === "O"}
          isActive={currentTurn === playerO && phase === "playing"}
          playerId={playerO}
        />
      </motion.div>

      {/* Turn indicator */}
      <AnimatePresence mode="wait">
        {phase === "playing" && (
          <motion.div
            key={isMyTurn ? "my-turn" : "their-turn"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="text-xs uppercase tracking-widest font-game"
            style={{
              color: isMyTurn
                ? mySymbol === "X" ? "#ff3d71" : "#00d4ff"
                : "#52526a",
            }}
          >
            {isMyTurn ? (
              <motion.span animate={{ opacity: [1, 0.6, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                ▶ YOUR TURN
              </motion.span>
            ) : (
              "opponent's turn"
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 24 }}
        className="w-full max-w-sm"
      >
        <Board
          board={board}
          isMyTurn={isMyTurn}
          mySymbol={mySymbol}
          phase={phase}
          onMove={sendMove}
        />
      </motion.div>

      {/* Leave button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={backToLobby}
        className="text-xs text-zinc-600 hover:text-zinc-400 font-game tracking-wider uppercase transition-colors py-2 px-4"
      >
        ← Leave Match
      </motion.button>

      {/* Game Over Modal */}
      <AnimatePresence>
        {phase === "game_over" && (
          <motion.div
            key="gameover-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backdropFilter: "blur(12px)", background: "rgba(7,7,15,0.7)" }}
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="w-full max-w-sm bg-surface-card border border-surface-border rounded-3xl p-8 text-center shadow-2xl"
            >
              {/* Result icon */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 500, damping: 18 }}
                className="mb-5"
              >
                {isDraw ? (
                  <span className="font-game text-7xl font-black text-amber-400" style={{ textShadow: "0 0 40px rgba(251,191,36,0.6)" }}>
                    ½
                  </span>
                ) : iWon ? (
                  <motion.span
                    animate={{ rotate: [0, -8, 8, -4, 4, 0] }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    className={`font-game text-7xl font-black block ${mySymbol === "X" ? "text-x" : "text-o"}`}
                    style={{
                      textShadow: mySymbol === "X"
                        ? "0 0 40px rgba(255,61,113,0.8)"
                        : "0 0 40px rgba(0,212,255,0.8)",
                    }}
                  >
                    {mySymbol}
                  </motion.span>
                ) : (
                  <span className={`font-game text-7xl font-black ${mySymbol === "X" ? "text-o" : "text-x"}`}>
                    {mySymbol === "X" ? "O" : "X"}
                  </span>
                )}
              </motion.div>

              {/* Result title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="font-game text-3xl font-black mb-2 tracking-wider"
                style={{
                  color: isDraw ? "#fbbf24" : iWon ? "#f0f0ff" : "#52526a",
                }}
              >
                {isDraw ? "DRAW!" : iWon ? "YOU WIN!" : "YOU LOSE"}
              </motion.h2>

              {/* Reason */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-sm text-zinc-500 mb-8 font-body"
              >
                {isDraw && "Neither player takes the win."}
                {iWon && gameOverReason === "timeout" && "Opponent ran out of time."}
                {iWon && gameOverReason === "opponent_disconnected" && "Opponent disconnected."}
                {iWon && gameOverReason === "normal" && "Well played."}
                {opponentWon && gameOverReason === "timeout" && "Time's up — you ran out of moves."}
                {opponentWon && gameOverReason === "normal" && "Better luck next time."}
              </motion.p>

              {/* Actions */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="flex flex-col gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { backToLobby(); findMatch(); }}
                  className="w-full py-3 rounded-xl font-game text-sm font-bold tracking-wider text-white"
                  style={{
                    background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                    boxShadow: "0 4px 24px rgba(99,102,241,0.4)",
                  }}
                >
                  ⚡ PLAY AGAIN
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={backToLobby}
                  className="w-full py-3 rounded-xl font-game text-xs tracking-wider border border-surface-border text-zinc-500 hover:text-zinc-300 hover:border-zinc-600 transition-all"
                >
                  BACK TO LOBBY
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Player badge ─────────────────────────────────────────────────────────────
function PlayerBadge({
  symbol,
  isMe,
  isActive,
  playerId,
}: {
  symbol: "X" | "O";
  isMe: boolean;
  isActive: boolean;
  playerId: string | null;
}) {
  const colorX = "#ff3d71";
  const colorO = "#00d4ff";
  const color = symbol === "X" ? colorX : colorO;
  const glow = symbol === "X"
    ? "rgba(255,61,113,0.5)"
    : "rgba(0,212,255,0.5)";

  return (
    <motion.div
      animate={
        isActive
          ? { boxShadow: [`0 0 0px ${glow}`, `0 0 16px ${glow}`, `0 0 0px ${glow}`] }
          : { boxShadow: "0 0 0px transparent" }
      }
      transition={isActive ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
      className="flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-colors duration-300"
      style={{
        borderColor: isActive ? color + "80" : "#1e1e3a",
        background: isActive ? color + "0a" : "#13132a",
        minWidth: 90,
      }}
    >
      <span
        className="font-game text-2xl font-black"
        style={{ color, textShadow: isActive ? `0 0 16px ${color}` : undefined }}
      >
        {symbol}
      </span>
      <span className="text-[10px] uppercase tracking-widest font-body" style={{ color: isActive ? color + "cc" : "#52526a" }}>
        {isMe ? "YOU" : playerId ? "OPPONENT" : "—"}
      </span>
    </motion.div>
  );
}
