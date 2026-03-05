// src/game/storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { TileResult } from "./types";

export type GameStatus = "playing" | "won" | "lost";

export type PersistedGame = {
  dayId: string;
  answer: string;
  guesses: string[];
  results: TileResult[][];
  currentGuess: string;
  status: GameStatus;
};

export type PersistedStats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastCompletedDayId: string | null;
  lastWinDayId: string | null;
};

const GAME_KEY = "arabicwordle.game.v1";
const STATS_KEY = "arabicwordle.stats.v1";
const HELP_SEEN_KEY = "arabicwordle.helpSeen.v1";

export async function saveGameState(state: PersistedGame) {
  await AsyncStorage.setItem(GAME_KEY, JSON.stringify(state));
}

export async function loadGameState(): Promise<PersistedGame | null> {
  const raw = await AsyncStorage.getItem(GAME_KEY);
  return raw ? (JSON.parse(raw) as PersistedGame) : null;
}

export async function clearGameState() {
  await AsyncStorage.removeItem(GAME_KEY);
}

export async function saveStats(stats: PersistedStats) {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
}

export async function loadStats(): Promise<PersistedStats | null> {
  const raw = await AsyncStorage.getItem(STATS_KEY);
  return raw ? (JSON.parse(raw) as PersistedStats) : null;
}

export async function hasSeenHelpModal(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(HELP_SEEN_KEY);
  return raw === "1";
}

export async function markHelpModalSeen() {
  await AsyncStorage.setItem(HELP_SEEN_KEY, "1");
}
