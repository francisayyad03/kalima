import { useEffect, useRef } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, Animated, Easing } from 'react-native';
import { Tile } from './tile';
import { TileResult } from '../game/types';

interface BoardProps {
  guesses: string[];
  results: TileResult[][];
  currentGuess: string;
  status: 'playing' | 'won' | 'lost';
  invalidGuessSignal?: number;
  invalidGuessRow?: number | null;
}

const ROWS = 6;
const COLS = 5;

function ShakeableRow({
  children,
  shouldShake,
  shakeSignal,
  style,
}: {
  children: React.ReactNode;
  shouldShake: boolean;
  shakeSignal: number;
  style: any;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastShakeSignalRef = useRef(0);

  useEffect(() => {
    if (!shouldShake || shakeSignal === 0 || shakeSignal === lastShakeSignalRef.current) return;
    lastShakeSignalRef.current = shakeSignal;

    Animated.sequence([
      Animated.timing(translateX, {
        toValue: -10,
        duration: 40,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 10,
        duration: 60,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: -8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 8,
        duration: 50,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: 0,
        duration: 40,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]).start();
  }, [shouldShake, shakeSignal, translateX]);

  return (
    <Animated.View style={[style, { transform: [{ translateX }] }]}>
      {children}
    </Animated.View>
  );
}

export function Board({
  guesses,
  results,
  currentGuess,
  status,
  invalidGuessSignal = 0,
  invalidGuessRow = null,
}: BoardProps) {
  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);
  const isTablet = Platform.OS === 'ios' ? shortSide >= 768 : shortSide >= 720;
  const isAndroidTablet = Platform.OS === 'android' && isTablet;
  const isAndroidWide = Platform.OS === 'android' && shortSide >= 600 && shortSide < 720;

  const boardMaxWidth = width * (isTablet ? (isAndroidTablet ? 0.67 : 0.75) : isAndroidWide ? 0.82 : 0.92);
  const boardMaxHeight = height * (isTablet ? (isAndroidTablet ? 0.50 : 0.62) : isAndroidWide ? 0.48 : 0.50);

  const gap = isTablet ? (isAndroidTablet ? 7 : 10) : isAndroidWide ? 4 : Platform.OS === 'ios' ? 1 : 6;

  const tileByWidth = Math.floor((boardMaxWidth - gap * (COLS - 1)) / COLS);
  const tileByHeight = Math.floor((boardMaxHeight - gap * (ROWS - 1)) / ROWS);

  let tileSize = Math.min(tileByWidth, tileByHeight);

  if (isTablet) {
    tileSize = isAndroidTablet
      ? Math.max(44, Math.min(tileSize, 70))
      : Math.max(56, Math.min(tileSize, 90)); // iPad bigger
  } else if (isAndroidWide) {
    tileSize = Math.max(42, Math.min(tileSize, 56));
  } else {
    tileSize = Math.max(40, Math.min(tileSize, 56));  // phones capped
  }

  const boardWidth = tileSize * COLS + gap * (COLS - 1);

  return (
    <View style={[styles.board, { width: boardWidth }]}>
      {Array.from({ length: ROWS }).map((_, rowIndex) => {
        const result = results[rowIndex];
        const isInvalidShakeRow = invalidGuessRow !== null && rowIndex === invalidGuessRow;

        return (
          <ShakeableRow
            key={rowIndex}
            shouldShake={isInvalidShakeRow}
            shakeSignal={invalidGuessSignal}
            style={[styles.row, { gap, marginBottom: gap }]}
          >
            {Array.from({ length: COLS }).map((_, colIndex) => {
              let letter = '';
              let state;

              if (result) {
                letter = result[colIndex].letter;
                state = result[colIndex].state;
              } else if (rowIndex === guesses.length) {
                letter = currentGuess[colIndex] || '';
              }

              const isWinningRevealRow = status === 'won' && rowIndex === results.length - 1;

              return (
                <Tile
                  key={colIndex}
                  letter={letter}
                  state={state}
                  size={tileSize}
                  revealDelayMs={isWinningRevealRow ? colIndex * 80 : 0}
                  animateReveal={isWinningRevealRow}
                />
              );
            })}
          </ShakeableRow>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row-reverse',
  },
});
