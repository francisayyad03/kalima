import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions, Platform } from 'react-native';
import { Key, KeyState } from './key';
import { ltrRow } from '../utils/layout';
import EnterKeyIcon from '../media/enterKey.svg';
import BackspaceKeyIcon from '../media/backspaceKey.svg';

interface KeyboardProps {
  onKey: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
  keyStates: Map<string, KeyState>;
}

const ROWS: string[][] = [
  ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج', '⌫'],
  ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك', 'ة'],
  ['ء', 'ظ', 'ط', 'ذ', 'د', 'ز', 'ر', 'و', 'ى', 'Enter'],
];

const KEY_H_MARGIN = 2.5;
const OUTER_PADDING = 6;
const MAX_KEYS = 12;

export function Keyboard({ onKey, onEnter, onBackspace, keyStates }: KeyboardProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const shortSide = Math.min(screenWidth, screenHeight);
  const isTablet = Platform.OS === 'ios' ? shortSide >= 768 : shortSide >= 720;
  const isAndroidTablet = Platform.OS === 'android' && isTablet;
  const isAndroidWide = Platform.OS === 'android' && shortSide >= 600 && shortSide < 720;
  const isLargePhone = !isTablet && !isAndroidWide && screenWidth >= 390;

  const { keyWidth, keyHeight, fontSize } = useMemo(() => {
    const available = screenWidth - OUTER_PADDING * 2;

    const totalMargins = MAX_KEYS * KEY_H_MARGIN * 2;
    let w = Math.floor((available - totalMargins) / MAX_KEYS);

    const minW = isTablet ? (isAndroidTablet ? 38 : 42) : isAndroidWide ? 30 : isLargePhone ? 26 : 24;
    const maxW = isTablet ? (isAndroidTablet ? 54 : 62) : isAndroidWide ? 42 : isLargePhone ? 40 : 36;
    w = Math.max(minW, Math.min(maxW, w));

    const minH = isTablet ? (isAndroidTablet ? 46 : 50) : isAndroidWide ? 40 : isLargePhone ? 54 : 40;
    const maxH = isTablet ? (isAndroidTablet ? 58 : 64) : isAndroidWide ? 52 : isLargePhone ? 68 : 50;
    const h = Math.max(minH, Math.min(maxH, Math.round(w * 1.15)));

    const fs = isTablet
      ? Math.round(w * (isAndroidTablet ? 0.46 : 0.48))
      : isAndroidWide
        ? Math.round(w * 0.47)
        : Math.round(w * 0.55);
    const clampedFs = Math.max(20, Math.min(26, fs));

    return { keyWidth: w, keyHeight: h, fontSize: clampedFs };
  }, [screenWidth, isTablet, isAndroidTablet, isAndroidWide, isLargePhone]);

  return (
    <View style={[styles.outer, { paddingHorizontal: OUTER_PADDING, marginBottom: isLargePhone ? 24 : 0 }]}>
      {ROWS.map((row, i) => (
        <View key={i} style={[styles.row, { flexDirection: ltrRow }]}>
          {row.map((k) => {
            if (k === 'Enter') {
              return (
                <Key
                  key="Enter"
                  label="Enter"
                  kind="action"
                  width={keyWidth}
                  height={keyHeight}
                  fontSize={fontSize}
                  Icon={EnterKeyIcon}
                  onPress={onEnter}
                />
              );
            }

            if (k === '⌫') {
              return (
                <Key
                  key="backspace"
                  label="Backspace"
                  kind="action"
                  width={keyWidth}
                  height={keyHeight}
                  fontSize={fontSize}
                  Icon={BackspaceKeyIcon}
                  onPress={onBackspace}
                />
              );
            }

            return (
              <Key
                key={k}
                label={k}
                width={keyWidth}
                height={keyHeight}
                fontSize={fontSize}
                state={keyStates.get(k)}
                onPress={() => onKey(k)}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 6,
  },
  row: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
