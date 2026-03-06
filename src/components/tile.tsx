import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { TileState } from '../game/types';
import { COLORS } from '../utils/colors';

interface TileProps {
  letter?: string;
  state?: TileState;
  size: number;
  revealDelayMs?: number;
  animateReveal?: boolean;
}

export function Tile({
  letter = '',
  state,
  size,
  revealDelayMs = 0,
  animateReveal = false,
}: TileProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevStateRef = useRef<TileState | undefined>(state);

  useEffect(() => {
    const prev = prevStateRef.current;
    const justRevealed = prev === undefined && state !== undefined;

    if (justRevealed && animateReveal) {
      Animated.sequence([
        Animated.delay(revealDelayMs),
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 110,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 120,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    prevStateRef.current = state;
  }, [animateReveal, revealDelayMs, scale, state]);

  const backgroundColor =
    state === 'correct'
      ? COLORS.green
      : state === 'present'
      ? COLORS.yellow
      : COLORS.grid;
  const fontSize = Math.round(size * 0.55);

  let textColor = 'white';

  if (state === 'correct' || state === 'present') {
    textColor = 'black';
  }

  if (state === 'absent') {
    textColor = COLORS.lightGrey;
  }

  const fontWeight = state === 'correct' || state === 'present' ? '700' : '600';

  return (
    <Animated.View
      style={[
        styles.tile,
        { backgroundColor, width: size, height: size, transform: [{ scale }] },
      ]}
    >
      <Text
        allowFontScaling={false}
        style={[
          styles.letter,
          {
            fontSize,
            color: textColor,
            fontFamily: 'System',
            fontWeight,
            includeFontPadding: false,
            textAlignVertical: 'center',
          },
        ]}
      >
        {letter}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    margin: 4,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '600',
  },
});
