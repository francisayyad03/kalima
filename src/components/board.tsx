import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Tile } from './tile';
import { TileResult } from '../game/types';

interface BoardProps {
  guesses: string[];
  results: TileResult[][];
  currentGuess: string;
  status: 'playing' | 'won' | 'lost';
}

const ROWS = 6;
const COLS = 5;

export function Board({ guesses, results, currentGuess, status }: BoardProps) {
  const { width, height } = useWindowDimensions();

  const shortSide = Math.min(width, height);
  const isTablet = Platform.OS === 'ios' ? shortSide >= 768 : shortSide >= 720;
  const isAndroidTablet = Platform.OS === 'android' && isTablet;
  const isAndroidWide = Platform.OS === 'android' && shortSide >= 600 && shortSide < 720;

  const boardMaxWidth = width * (isTablet ? (isAndroidTablet ? 0.67 : 0.75) : isAndroidWide ? 0.82 : 0.92);
  const boardMaxHeight = height * (isTablet ? (isAndroidTablet ? 0.50 : 0.62) : isAndroidWide ? 0.48 : 0.50);

  const gap = isTablet ? (isAndroidTablet ? 7 : 10) : isAndroidWide ? 4 : 6;

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

        return (
          <View key={rowIndex} style={[styles.row, { gap, marginBottom: gap }]}>
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
          </View>
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
