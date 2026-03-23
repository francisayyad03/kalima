import React from 'react';
import { Platform, Pressable, Text, ViewStyle } from 'react-native';
import { COLORS } from '../utils/colors';
import type { SvgProps } from 'react-native-svg';

export type KeyState = 'correct' | 'present' | 'absent';

interface KeyProps {
  label: string;
  onPress: () => void;
  state?: KeyState;
  width: number;
  height: number;
  kind?: 'normal' | 'action';
  fontSize?: number;
  Icon?: React.ComponentType<SvgProps>;
}

export function Key({
  label,
  onPress,
  state,
  width,
  height,
  kind = 'normal',
  fontSize = 18,
  Icon,
}: KeyProps) {
  const backgroundColor =
    state === 'correct' ? COLORS.green :
    state === 'present' ? COLORS.yellow :
    state === 'absent'  ? COLORS.grid  :
    COLORS.lightGrey;

  const fontWeight = '500';
  const color = state === 'absent' ? COLORS.lightGrey : '#1B1B1B';
  const fontFamily = Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  });

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
          borderWidth: 1,
          borderColor: 'rgba(0, 0, 0, 0.08)',
          transform: [{ scale: pressed ? 0.95 : 1 }],
          opacity: pressed ? 0.88 : 1,
        } as ViewStyle,
      ]}
    >
      {Icon ? (
        <Icon width={Math.round(fontSize * 1.2)} height={Math.round(fontSize * 1.2)} />
      ) : (
        <Text
          allowFontScaling={false}
          style={{
            fontFamily,
            fontSize,
            fontWeight,
            color,
            includeFontPadding: false,
            textAlignVertical: 'center',
          }}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
