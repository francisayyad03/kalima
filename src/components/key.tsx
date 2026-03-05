import React from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';
import { COLORS } from '../utils/colors';

export type KeyState = 'correct' | 'present' | 'absent';

interface KeyProps {
  label: string;
  onPress: () => void;
  state?: KeyState;
  width: number;
  height: number;
  kind?: 'normal' | 'action';
  fontSize?: number;
}

export function Key({
  label,
  onPress,
  state,
  width,
  height,
  kind = 'normal',
  fontSize = 18,
}: KeyProps) {
  const backgroundColor =
    state === 'correct' ? COLORS.green :
    state === 'present' ? COLORS.yellow :
    state === 'absent'  ? COLORS.grid  :
    COLORS.lightGrey;

  const fontWeight = '400';
  const color = state === 'absent' ? COLORS.lightGrey : '#1B1B1B';

  const borderRadius = Math.round(width * 0.28);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          width,
          height,
          backgroundColor,
          borderRadius,
          alignItems: 'center',
          justifyContent: 'center',
          marginHorizontal: 2.5,
          marginVertical: 3,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.22,
          shadowRadius: 3,
          elevation: 3,
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.88 : 1,
        } as ViewStyle,
      ]}
    >
      <Text
        allowFontScaling={false}
        style={{
          fontFamily: 'System',
          fontSize,
          fontWeight,
          color,
          includeFontPadding: false,
          textAlignVertical: 'center',
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
