import { motion, AnimatePresence } from "framer-motion";

// ─── Winning line helper ──────────────────────────────────────────────────────
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

export function getWinningLine(board: number[]): number[] | null {
  for (const [a, b, c] of LINES) {
    if (board[a] !== 0 && board[a] === board[b] && board[a] === board[c]) {
      return [a, b, c];
    }
  }
  return null;
}

// ─── X mark ──────────────────────────────────────────────────────────────────
function XMark({ isWinner }: { isWinner: boolean }) {
  return (
    <motion.div
      className="w-[60%] h-[60%]"
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.path
          d="M 18 18 L 82 82"
          stroke={isWinner ? "#ff3d71" : "#ff3d71"}
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={isWinner ? { filter: "drop-shadow(0 0 8px rgba(255,61,113,0.9))" } : {}}
        />
        <motion.path
          d="M 82 18 L 18 82"
          stroke="#ff3d71"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.25, ease: "easeOut", delay: 0.12 }}
          style={isWinner ? { filter: "drop-shadow(0 0 8px rgba(255,61,113,0.9))" } : {}}
        />
      </svg>
    </motion.div>
  );
}

// ─── O mark ──────────────────────────────────────────────────────────────────
function OMark({ isWinner }: { isWinner: boolean }) {
  return (
    <motion.div
      className="w-[60%] h-[60%]"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
        <motion.circle
          cx="50"
          cy="50"
          r="32"
          stroke="#00d4ff"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          transform="rotate(-90, 50, 50)"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={isWinner ? { filter: "drop-shadow(0 0 8px rgba(0,212,255,0.9))" } : {}}
        />
      </svg>
    </motion.div>
  );
}

// ─── Single cell ─────────────────────────────────────────────────────────────
interface CellProps {
  index: number;
  value: number;
  isWinner: boolean;
  canClick: boolean;
  mySymbol: "X" | "O" | null;
  onClick: () => void;
}

function Cell({ index: _index, value, isWinner, canClick, mySymbol, onClick }: CellProps) {
  const hoverBg =
    canClick && mySymbol === "X"
      ? "rgba(255,61,113,0.08)"
      : canClick && mySymbol === "O"
      ? "rgba(0,212,255,0.08)"
      : undefined;

  return (
    <motion.button
      onClick={canClick ? onClick : undefined}
      disabled={!canClick}
      className="relative flex items-center justify-center rounded-2xl border transition-colors duration-150 w-full h-full"
      style={{
        background: isWinner
          ? value === 1
            ? "rgba(255,61,113,0.08)"
            : "rgba(0,212,255,0.08)"
          : "#13132a",
        borderColor: isWinner
          ? value === 1
            ? "rgba(255,61,113,0.6)"
            : "rgba(0,212,255,0.6)"
          : "#1e1e3a",
        boxShadow: isWinner
          ? value === 1
            ? "0 0 20px rgba(255,61,113,0.35), inset 0 0 20px rgba(255,61,113,0.1)"
            : "0 0 20px rgba(0,212,255,0.35), inset 0 0 20px rgba(0,212,255,0.1)"
          : undefined,
        cursor: canClick ? "pointer" : "default",
      }}
      whileHover={canClick ? { backgroundColor: hoverBg, scale: 1.03 } : {}}
      whileTap={canClick ? { scale: 0.95 } : {}}
      animate={
        isWinner
          ? {
              boxShadow: [
                value === 1
                  ? "0 0 20px rgba(255,61,113,0.35)"
                  : "0 0 20px rgba(0,212,255,0.35)",
                value === 1
                  ? "0 0 40px rgba(255,61,113,0.7)"
                  : "0 0 40px rgba(0,212,255,0.7)",
                value === 1
                  ? "0 0 20px rgba(255,61,113,0.35)"
                  : "0 0 20px rgba(0,212,255,0.35)",
              ],
            }
          : {}
      }
      transition={isWinner ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : {}}
    >
      <AnimatePresence>
        {value === 1 && <XMark isWinner={isWinner} />}
        {value === 2 && <OMark isWinner={isWinner} />}
      </AnimatePresence>
    </motion.button>
  );
}

// ─── Board ────────────────────────────────────────────────────────────────────
interface BoardProps {
  board: number[];
  isMyTurn: boolean;
  mySymbol: "X" | "O" | null;
  phase: string;
  onMove: (index: number) => void;
}

export default function Board({ board, isMyTurn, mySymbol, phase, onMove }: BoardProps) {
  const winningLine = getWinningLine(board);
  const gameOver = phase === "game_over";

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.04 } },
  };
  const cellVariants = {
    hidden: { opacity: 0, scale: 0.7 },
    visible: { opacity: 1, scale: 1, transition: { type: "spring" as const, stiffness: 400, damping: 20 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-3 gap-3 w-full"
      style={{ aspectRatio: "1" }}
    >
      {board.map((value, i) => (
        <motion.div key={i} variants={cellVariants} className="w-full h-full">
          <Cell
            index={i}
            value={value}
            isWinner={winningLine?.includes(i) ?? false}
            canClick={!gameOver && isMyTurn && value === 0}
            mySymbol={mySymbol}
            onClick={() => onMove(i)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
