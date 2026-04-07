import { create } from "zustand";
import { Client, Session, Socket } from "@heroiclabs/nakama-js";
import type { Screen, Phase, LeaderboardEntry, StateUpdatePayload, GameOverPayload, TimerPayload } from "../types/game";

const SERVER_KEY = import.meta.env.VITE_NAKAMA_KEY as string;
// Strip accidental protocol prefix (https://) and trailing slash so the
// Nakama SDK constructs valid URLs regardless of how the env var is pasted.
const SERVER_HOST = (import.meta.env.VITE_NAKAMA_HOST as string).replace(/^https?:\/\//, "").replace(/\/$/, "");
const SERVER_PORT = import.meta.env.VITE_NAKAMA_PORT as string;
const SERVER_SSL = import.meta.env.VITE_NAKAMA_SSL === "true";
const DEVICE_ID_KEY = "ttt_device_id";

const OPCODES = {
  MOVE: 1,
  STATE_UPDATE: 2,
  GAME_OVER: 3,
  ERROR: 4,
  TIMER_UPDATE: 5,
} as const;

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

interface GameStore {
  // Nakama connection
  client: Client | null;
  session: Session | null;
  socket: Socket | null;
  isConnected: boolean;

  // Navigation
  screen: Screen;

  // Identity
  myUserId: string | null;
  myUsername: string | null;

  // Match
  matchId: string | null;
  matchmakerTicket: string | null;
  createdMatchId: string | null;

  // Live game state (synced from server)
  board: number[];
  playerX: string | null;
  playerO: string | null;
  currentTurn: string | null;
  phase: Phase;
  winner: string | null;
  isDraw: boolean;
  gameOverReason: string | null;
  timer: number;

  // Leaderboard
  leaderboard: LeaderboardEntry[];

  // UI
  error: string | null;

  // Actions
  init: () => Promise<void>;
  findMatch: () => Promise<void>;
  cancelMatchmaking: () => Promise<void>;
  createRoom: () => Promise<void>;
  joinRoom: (matchId: string) => Promise<void>;
  sendMove: (cellIndex: number) => void;
  fetchLeaderboard: () => Promise<void>;
  backToLobby: () => void;
  setError: (error: string | null) => void;
  setScreen: (screen: Screen) => void;
  clearCreatedMatch: () => void;
}

interface FreshGame {
  matchId: null;
  board: number[];
  playerX: null;
  playerO: null;
  currentTurn: null;
  phase: "waiting";
  winner: null;
  isDraw: false;
  gameOverReason: null;
  timer: number;
}

const freshGame = (): FreshGame => ({
  matchId: null,
  board: Array(9).fill(0) as number[],
  playerX: null,
  playerO: null,
  currentTurn: null,
  phase: "waiting",
  winner: null,
  isDraw: false,
  gameOverReason: null,
  timer: 30,
});

export const useGameStore = create<GameStore>((set, get) => ({
  client: null,
  session: null,
  socket: null,
  isConnected: false,
  screen: "lobby",
  myUserId: null,
  myUsername: null,
  matchmakerTicket: null,
  createdMatchId: null,
  leaderboard: [],
  error: null,
  ...freshGame(),

  init: async () => {
    const client = new Client(SERVER_KEY, SERVER_HOST, SERVER_PORT, SERVER_SSL);
    const deviceId = getOrCreateDeviceId();
    const username = `Player_${deviceId.slice(0, 6).toUpperCase()}`;

    try {
      const session = await client.authenticateDevice(deviceId, true, username);
      const socket = client.createSocket(SERVER_SSL, false);

      socket.onmatchmakermatched = async (matched) => {
        const joinId = matched.match_id ?? matched.token;
        if (!joinId) {
          set({ error: "Matchmaker: no match ID received", screen: "lobby" });
          return;
        }

        set({ ...freshGame(), screen: "game", matchmakerTicket: null });
        try {
          const match = await socket.joinMatch(joinId);
          set({ matchId: match.match_id });
        } catch (e) {
          set({ error: `Failed to join matched game: ${e}`, screen: "lobby" });
        }
      };

      socket.onmatchdata = (data) => {
        // data.data can be Uint8Array or base64 string depending on SDK version
        let raw: string;
        if (typeof data.data === "string") {
          raw = data.data;
        } else {
          raw = new TextDecoder().decode(data.data);
        }
        let payload: unknown;
        try {
          payload = JSON.parse(raw);
        } catch {
          return;
        }

        // op_code may be a string over the wire — coerce to number for switch
        switch (Number(data.op_code)) {
          case OPCODES.STATE_UPDATE: {
            const p = payload as StateUpdatePayload;
            set({
              board: p.board,
              currentTurn: p.currentTurn,
              phase: p.phase,
              playerX: p.playerX,
              playerO: p.playerO,
            });
            break;
          }
          case OPCODES.GAME_OVER: {
            const p = payload as GameOverPayload;
            set({
              board: p.board,
              playerX: p.playerX,
              playerO: p.playerO,
              winner: p.winner,
              isDraw: p.isDraw,
              gameOverReason: p.reason,
              phase: "game_over",
            });
            break;
          }
          case OPCODES.TIMER_UPDATE: {
            const p = payload as TimerPayload;
            set({ timer: p.remaining });
            break;
          }
          case OPCODES.ERROR: {
            const p = payload as { reason: string };
            set({ error: p.reason });
            break;
          }
        }
      };

      socket.ondisconnect = () => {
        set({ isConnected: false, error: "Disconnected from server", screen: "lobby" });
      };

      await socket.connect(session, true);

      set({
        client,
        session,
        socket,
        isConnected: true,
        myUserId: session.user_id,
        myUsername: session.username || username,
      });
    } catch {
      set({ error: "Could not connect to Nakama server — is Docker running?" });
    }
  },

  // ── matchmaking
  findMatch: async () => {
    const { socket } = get();
    if (!socket) return;
    try {
      const ticket = await socket.addMatchmaker("*", 2, 2);
      set({ screen: "matchmaking", matchmakerTicket: ticket.ticket });
    } catch {
      set({ error: "Failed to start matchmaking" });
    }
  },

  cancelMatchmaking: async () => {
    const { socket, matchmakerTicket } = get();
    if (socket && matchmakerTicket) {
      try {
        await socket.removeMatchmaker(matchmakerTicket);
      } catch {
        // ignore
      }
    }
    set({ screen: "lobby", matchmakerTicket: null });
  },

  createRoom: async () => {
    const { client, session, socket } = get();
    if (!client || !session || !socket) return;
    try {
      const result = await client.rpc(session, "create_match", {});
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw: any = result.payload;
      const parsed = (typeof raw === "string" ? JSON.parse(raw) : raw) as { match_id: string };
      const match_id = parsed.match_id;
      if (!match_id) throw new Error("RPC returned no match_id");
      // Reset and show game screen BEFORE joinMatch — same race-condition fix
      set({
        createdMatchId: match_id,
        screen: "lobby", // stay in lobby
      });
      // const match = await socket.joinMatch(match_id);
      // set({ matchId: match.match_id, createdMatchId: match.match_id });
    } catch {
      set({ error: "Failed to create room" });
    }
  },

  joinRoom: async (matchId: string) => {
    const { socket } = get();
    if (!socket) return;
    try {
      set({ ...freshGame(), screen: "game" });
      const match = await socket.joinMatch(matchId);
      set({ matchId: match.match_id });
    } catch {
      set({ error: "Failed to join room — check the ID and try again" });
    }
  },

  sendMove: (cellIndex: number) => {
    const { socket, matchId, myUserId, currentTurn, phase, board } = get();
    if (!socket || !matchId || !myUserId) return;
    if (phase !== "playing" || currentTurn !== myUserId) return;
    if (board[cellIndex] !== 0) return;
    socket.sendMatchState(matchId, OPCODES.MOVE, JSON.stringify({ cellIndex }));
  },

  fetchLeaderboard: async () => {
    const { client, session } = get();
    if (!client || !session) return;
    try {
      const result = await client.listLeaderboardRecords(session, "global_wins", [], 10);
      const entries: LeaderboardEntry[] = (result.records ?? []).map((r, i) => ({
        rank: i + 1,
        userId: r.owner_id ?? "",
        username: r.username ?? `Player_${(r.owner_id ?? "").slice(0, 6)}`,
        wins: Number(r.score ?? 0),
      }));
      set({ leaderboard: entries, screen: "leaderboard" });
    } catch {
      set({ error: "Failed to load leaderboard" });
    }
  },

  backToLobby: () => {
    const { socket, matchId } = get();
    if (socket && matchId) {
      socket.leaveMatch(matchId).catch(() => {});
    }
    set({ screen: "lobby", createdMatchId: null, ...freshGame() });
  },

  clearCreatedMatch: () => set({ createdMatchId: null }),
  setError: (error) => set({ error }),
  setScreen: (screen) => set({ screen }),
}));
