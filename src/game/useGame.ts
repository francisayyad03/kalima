import { useEffect, useState } from 'react';
import { evaluateGuess } from './rules';
import { isGuessAllowed } from './validator';
import { getDailyWord, getDailyWordDisplay } from './dailyword';
import { TileResult } from './types';
import { ALLOWED_WORDS } from '../data/allowed';
import { normalizeArabic } from '../utils/arabic';
import { getLocalDayId, diffDays } from '../utils/day';
import {
  loadGameState,
  saveGameState,
  loadStats,
  saveStats,
  loadCompletedGameState,
  saveCompletedGameState,
} from './storage';

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

export type GameStatus = 'playing' | 'won' | 'lost';

type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastCompletedDayId?: string | null;
  lastWinDayId?: string | null;
};

const DEFAULT_STATS: Stats = {
  gamesPlayed: 0,
  gamesWon: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: [0, 0, 0, 0, 0, 0],
  lastCompletedDayId: null,
  lastWinDayId: null,
};

export function useGame() {
  const initialDayId = getLocalDayId();

  // Same as your old: answer is stable + deterministic per day
  const [dayId, setDayId] = useState(initialDayId);
  const [answer, setAnswer] = useState(() => getDailyWord(initialDayId));
  const answerDisplay = getDailyWordDisplay(dayId);

  const [guesses, setGuesses] = useState<string[]>([]);
  const [results, setResults] = useState<TileResult[][]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [status, setStatus] = useState<GameStatus>('playing');
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);

  const [hydrated, setHydrated] = useState(false);

  // LOAD once (hydrate)
  useEffect(() => {
    (async () => {
      const today = getLocalDayId();

      // stats
      const savedStats = await loadStats();
      if (savedStats) setStats(savedStats as any);

      // game
      const savedGame = await loadGameState();
      const savedCompletedGame = await loadCompletedGameState();

      // always compute answer from dayId (source of truth)
      const todayAnswer = getDailyWord(today);

      if (savedGame) {
        const isSameDay = savedGame.dayId === today;
        const movedBackInTime = diffDays(today, savedGame.dayId) < 0;

        if (isSameDay || movedBackInTime) {
          if (movedBackInTime && savedCompletedGame && savedCompletedGame.dayId === today) {
            setDayId(today);
            setAnswer(todayAnswer);
            setGuesses(savedCompletedGame.guesses ?? []);
            setResults(savedCompletedGame.results ?? []);
            setCurrentGuess('');
            setStatus(savedCompletedGame.status ?? 'lost');
            setHydrated(true);
            return;
          }

          const effectiveDayId = movedBackInTime ? savedGame.dayId : today;
          const effectiveAnswer = getDailyWord(effectiveDayId);

          setDayId(effectiveDayId);
          setAnswer(effectiveAnswer);

          setGuesses(savedGame.guesses ?? []);
          setResults(savedGame.results ?? []);
          setCurrentGuess(savedGame.currentGuess ?? '');
          setStatus(savedGame.status ?? 'playing');
        } else {
          // new day -> fresh board
          setDayId(today);
          setAnswer(todayAnswer);

          setGuesses([]);
          setResults([]);
          setCurrentGuess('');
          setStatus('playing');
        }
      } else {
        // new day -> fresh board
        setDayId(today);
        setAnswer(todayAnswer);

        setGuesses([]);
        setResults([]);
        setCurrentGuess('');
        setStatus('playing');
      }

      setHydrated(true);
    })();
  }, []);

  // SAVE game state after hydration (prevents overwrite-on-mount bug)
  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      await saveGameState({
        dayId,
        answer,
        guesses,
        results,
        currentGuess,
        status,
      });
    })();
  }, [hydrated, dayId, answer, guesses, results, currentGuess, status]);

  // SAVE stats after hydration
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      await saveStats(stats as any);
    })();
  }, [hydrated, stats]);

  function addLetter(letter: string) {
    if (status !== 'playing') return;
    if (currentGuess.length >= WORD_LENGTH) return;
    setCurrentGuess(prev => prev + letter);
  }

  function removeLetter() {
    if (status !== 'playing') return;
    setCurrentGuess(prev => prev.slice(0, -1));
  }

  function submitGuess() {
    if (status !== 'playing') return;
    if (currentGuess.length !== WORD_LENGTH) return;

    if (!isGuessAllowed(currentGuess, ALLOWED_WORDS)) {
      return false;
    }

    const normalizedGuess = normalizeArabic(currentGuess);
    const normalizedAnswer = normalizeArabic(answer);

    const evaluation = evaluateGuess(normalizedGuess, normalizedAnswer);

    const nextGuesses = [...guesses, currentGuess];
    const nextResults = [...results, evaluation];

    setGuesses(nextGuesses);
    setResults(nextResults);
    setCurrentGuess('');

    // WIN
    if (normalizedGuess === normalizedAnswer) {
      setStatus('won');
      const today = dayId;
      void saveCompletedGameState({
        dayId: today,
        answer,
        guesses: nextGuesses,
        results: nextResults,
        currentGuess: '',
        status: 'won',
      });
      setStats(prev => {
        if (prev.lastCompletedDayId === today) return prev;
        const guessesUsed = nextGuesses.length;
        const dist = [...prev.guessDistribution];
        if (guessesUsed >= 1 && guessesUsed <= 6) dist[guessesUsed - 1]++;
        const continues = prev.lastWinDayId !== null && diffDays(today, prev.lastWinDayId as string) === 1;
        const currentStreak = continues ? prev.currentStreak + 1 : 1;

        return {
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          gamesWon: prev.gamesWon + 1,
          currentStreak,
          maxStreak: Math.max(prev.maxStreak, currentStreak),
          guessDistribution: dist,
          lastCompletedDayId: today,
          lastWinDayId: today,
        };
      });

      return true;
    }

    // LOSS
    if (nextGuesses.length >= MAX_GUESSES) {
      setStatus('lost');
      const today = dayId;
      void saveCompletedGameState({
        dayId: today,
        answer,
        guesses: nextGuesses,
        results: nextResults,
        currentGuess: '',
        status: 'lost',
      });
      setStats(prev => {
        if (prev.lastCompletedDayId === today) return prev;
        return {
        ...prev,
        gamesPlayed: prev.gamesPlayed + 1,
        currentStreak: 0,
        lastCompletedDayId: today,
      };
      });
    }
    return true;
  }

  return {
    answer,
    answerDisplay,
    guesses,
    results,
    currentGuess,
    status,
    addLetter,
    removeLetter,
    submitGuess,
    stats,
    dayId
  };
}
