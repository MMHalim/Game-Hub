import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export interface GamePlayer {
  id: string;
  name: string;
  celebrityId: string;
  score: number;
}

export interface GameSession {
  id: string;
  code: string;
  hostName: string;
  players: GamePlayer[];
  status: "lobby" | "playing" | "finished";
  currentTurnIndex: number;
  createdAt: number;
  turnScores: number[];
}

interface GameState {
  activeSession: GameSession | null;
  createSession: (
    hostName: string,
    players: { name: string; celebrityId: string }[]
  ) => Promise<GameSession>;
  joinSession: (code: string, playerName: string) => Promise<GameSession>;
  loadSession: (id: string) => Promise<GameSession | null>;
  startGame: (sessionId: string) => Promise<void>;
  submitTurnScore: (sessionId: string, score: number) => Promise<GameSession>;
  resetGame: () => void;
}

const GameContext = createContext<GameState | null>(null);

const SESSIONS_KEY = "lr_sessions";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

async function getSessions(): Promise<Record<string, GameSession>> {
  const raw = await AsyncStorage.getItem(SESSIONS_KEY);
  return raw ? JSON.parse(raw) : {};
}

async function saveSession(session: GameSession): Promise<void> {
  const sessions = await getSessions();
  sessions[session.id] = session;
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [activeSession, setActiveSession] = useState<GameSession | null>(null);

  const createSession = useCallback(
    async (
      hostName: string,
      players: { name: string; celebrityId: string }[]
    ) => {
      const session: GameSession = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        code: generateCode(),
        hostName,
        players: players.map((p, i) => ({
          id: `p_${i}_${Date.now()}`,
          name: p.name,
          celebrityId: p.celebrityId,
          score: 0,
        })),
        status: "lobby",
        currentTurnIndex: 0,
        createdAt: Date.now(),
        turnScores: [],
      };
      await saveSession(session);
      setActiveSession(session);
      return session;
    },
    []
  );

  const joinSession = useCallback(async (code: string, playerName: string) => {
    const sessions = await getSessions();
    const session = Object.values(sessions).find(
      (s) => s.code === code.toUpperCase() && s.status === "lobby"
    );
    if (!session) throw new Error("Session not found or already started.");
    const updatedSession: GameSession = {
      ...session,
      players: [
        ...session.players,
        {
          id: `p_join_${Date.now()}`,
          name: playerName,
          celebrityId: session.players[0]?.celebrityId ?? "jim-carrey",
          score: 0,
        },
      ],
    };
    await saveSession(updatedSession);
    setActiveSession(updatedSession);
    return updatedSession;
  }, []);

  const loadSession = useCallback(async (id: string) => {
    const sessions = await getSessions();
    return sessions[id] ?? null;
  }, []);

  const startGame = useCallback(async (sessionId: string) => {
    const sessions = await getSessions();
    const session = sessions[sessionId];
    if (!session) return;
    const updated = { ...session, status: "playing" as const };
    await saveSession(updated);
    setActiveSession(updated);
  }, []);

  const submitTurnScore = useCallback(
    async (sessionId: string, score: number) => {
      const sessions = await getSessions();
      const session = sessions[sessionId];
      if (!session) throw new Error("Session not found");

      const roundedScore = Math.round(score);
      const newTurnScores = [...session.turnScores, roundedScore];
      const nextTurnIndex = session.currentTurnIndex + 1;
      const isFinished = nextTurnIndex >= session.players.length;

      const updatedPlayers = session.players.map((p, i) =>
        i === session.currentTurnIndex
          ? { ...p, score: roundedScore }
          : p
      );

      const updated: GameSession = {
        ...session,
        players: updatedPlayers,
        turnScores: newTurnScores,
        currentTurnIndex: nextTurnIndex,
        status: isFinished ? "finished" : "playing",
      };

      await saveSession(updated);
      setActiveSession(updated);
      return updated;
    },
    []
  );

  const resetGame = useCallback(() => {
    setActiveSession(null);
  }, []);

  return (
    <GameContext.Provider
      value={{
        activeSession,
        createSession,
        joinSession,
        loadSession,
        startGame,
        submitTurnScore,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
