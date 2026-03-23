import { useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Board } from '../components/board';
import { Keyboard } from '../components/keyboard';
import { GameOverModal } from '../components/GameOverModal';
import { getKeyboardState } from '../game/keyboardState';
import { useGame } from '../game/useGame';
import { hasSeenHelpModal, markHelpModalSeen } from '../game/storage';
import { COLORS } from '../utils/colors';
import HelpIcon from '../media/help.svg';
import StatsIcon from '../media/stats.svg';
import KalemahLogo from '../media/kalemah.svg';

interface DailyWordleScreenProps {
  game: ReturnType<typeof useGame>;
  onBack: () => void;
  setShowHelp: (value: boolean) => void;
  setShowStats: (value: boolean) => void;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}

export function DailyWordleScreen({
  game,
  onBack,
  setShowHelp,
  setShowStats,
  showModal,
  setShowModal,
}: DailyWordleScreenProps) {
  const keyStates = getKeyboardState(game.results);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = Platform.OS === 'ios' ? shortSide >= 768 : shortSide >= 720;
  const isAndroidTablet = Platform.OS === 'android' && isTablet;
  const isAndroidWide = Platform.OS === 'android' && shortSide >= 600 && shortSide < 720;
  const isAndroidPhone = Platform.OS === 'android' && !isTablet && !isAndroidWide;
  const isAndroidSmallPhone = isAndroidPhone && height <= 760;
  const isSmallPhone = !isTablet && height <= 700;
  const isLargePhone = !isTablet && !isAndroidWide && !isSmallPhone;

  const iconSize = isTablet ? (isAndroidTablet ? 28 : 30) : isAndroidWide ? 24 : isSmallPhone ? 20 : 22;

  const ROWS = 6;
  const COLS = 5;
  const boardGap = isTablet ? (isAndroidTablet ? 7 : 10) : isAndroidWide ? 8 : 6;
  const boardMaxWidth = width * (isTablet ? (isAndroidTablet ? 0.67 : 0.75) : isAndroidWide ? 0.84 : 0.92);
  const boardMaxHeight = height * (isTablet ? (isAndroidTablet ? 0.47 : 0.6) : isAndroidWide ? 0.5 : 0.44);
  const tileByWidth = Math.floor((boardMaxWidth - boardGap * (COLS - 1)) / COLS);
  const tileByHeight = Math.floor((boardMaxHeight - boardGap * (ROWS - 1)) / ROWS);
  let tileSize = Math.min(tileByWidth, tileByHeight);
  tileSize = isTablet
    ? (isAndroidTablet ? Math.max(44, Math.min(tileSize, 70)) : Math.max(56, Math.min(tileSize, 90)))
    : isAndroidWide
      ? Math.max(46, Math.min(tileSize, 64))
      : Math.max(40, Math.min(tileSize, 56));
  const baseHeaderWidth = tileSize * COLS + boardGap * (COLS - 1);
  const headerWidth = isAndroidTablet ? baseHeaderWidth + 16 : baseHeaderWidth;

  const pillPadV = isTablet ? (isAndroidTablet ? 14 : 16) : isAndroidWide ? 12 : 10;
  const pillPadH = isTablet ? (isAndroidTablet ? 18 : 22) : isAndroidWide ? 16 : 14;
  const circleSize = isTablet ? (isAndroidTablet ? 44 : 48) : isAndroidWide ? 40 : 36;
  const circleRadius = circleSize / 2;
  const actionGap = isTablet ? 10 : 8;
  const leftActionWidth = circleSize * 2 + actionGap;
  const baseLogoWidth = isTablet ? (isAndroidTablet ? 210 : 240) : isAndroidWide ? 170 : isSmallPhone ? 130 : 150;
  const logoWidth = Platform.OS === 'android'
    ? Math.min(baseLogoWidth, Math.max(112, headerWidth - leftActionWidth - circleSize - (pillPadH * 2) - 24))
    : baseLogoWidth;
  const logoHeight = isTablet ? (isAndroidTablet ? 50 : 56) : isAndroidWide ? 36 : 30;

  const safeTop = Math.max(0, Math.min(insets.top, 20));
  const headerTopPad =
    safeTop + (isSmallPhone ? 8 : isLargePhone ? 0 : isAndroidWide ? 0 : 10) + (isAndroidPhone ? 14 : 0);
  const boardTopPad =
    (isSmallPhone ? 0 : isLargePhone ? 4 : isAndroidWide ? 6 : 10) + (isAndroidPhone ? 4 : 0);
  const boardBottomPad = isLargePhone ? 20 : 8;
  const headerLift = isAndroidSmallPhone ? -28 : isAndroidTablet ? -24 : isAndroidWide ? -12 : 0;
  const boardLift = isAndroidSmallPhone ? -8 : 0;

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [invalidGuessSignal, setInvalidGuessSignal] = useState(0);
  const [invalidGuessRow, setInvalidGuessRow] = useState<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);

    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1400);
  };

  useEffect(() => {
    let isMounted = true;

    const openHelpOnFirstGameOpen = async () => {
      try {
        const seen = await hasSeenHelpModal();
        if (!seen) {
          await markHelpModalSeen();
          if (isMounted) setShowHelp(true);
        }
      } catch {
      }
    };

    void openHelpOnFirstGameOpen();

    return () => {
      isMounted = false;
    };
  }, [setShowHelp]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={[styles.headerWrap, { paddingTop: headerTopPad, marginTop: headerLift }]}>
        <View
          style={[
            styles.headerPill,
            {
              width: headerWidth,
              paddingVertical: pillPadV,
              paddingHorizontal: pillPadH,
            },
          ]}
        >
          <View style={[styles.headerActions, { gap: actionGap }]}>
            <TouchableOpacity
              style={[
                styles.circleButton,
                { width: circleSize, height: circleSize, borderRadius: circleRadius },
              ]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="home-outline" size={iconSize} color={COLORS.lightGrey} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.circleButton,
                { width: circleSize, height: circleSize, borderRadius: circleRadius },
              ]}
              onPress={() => setShowHelp(true)}
              activeOpacity={0.8}
            >
              <HelpIcon width={iconSize} height={iconSize} />
            </TouchableOpacity>
          </View>

          <View style={styles.logoWrap}>
            <KalemahLogo width={logoWidth} height={logoHeight} />
          </View>

          <TouchableOpacity
            style={[
              styles.circleButton,
              { width: circleSize, height: circleSize, borderRadius: circleRadius },
            ]}
            onPress={() => setShowStats(true)}
            activeOpacity={0.8}
          >
            <StatsIcon width={iconSize} height={iconSize} />
          </TouchableOpacity>
        </View>
      </View>

      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <View style={[styles.boardContainer, { paddingTop: boardTopPad, paddingBottom: boardBottomPad, marginTop: boardLift }]}>
        <Board
          guesses={game.guesses}
          results={game.results}
          currentGuess={game.currentGuess}
          status={game.status}
          invalidGuessSignal={invalidGuessSignal}
          invalidGuessRow={invalidGuessRow}
        />
      </View>

      <View style={[styles.keyboardContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Keyboard
          onKey={game.addLetter}
          onEnter={() => {
            if (game.currentGuess.length !== 5) return;
            const ok = game.submitGuess();
            if (!ok) {
              setInvalidGuessRow(game.guesses.length);
              setInvalidGuessSignal(prev => prev + 1);
              showToast('الكلمة غير موجودة في القائمة');
            }
          }}
          onBackspace={game.removeLetter}
          keyStates={keyStates}
        />
      </View>

      {game.status !== 'playing' && (
        <GameOverModal
          visible={showModal}
          status={game.status}
          answer={game.answerDisplay}
          stats={game.stats}
          results={game.results}
          onClose={() => setShowModal(false)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },
  headerWrap: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerPill: {
    borderRadius: 15,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(218, 220, 224, 0.03)',
    shadowColor: COLORS.charcoal,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(218, 220, 224, 0.06)',
  },
  circleButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  toast: {
    position: 'absolute',
    top: 144,
    alignSelf: 'center',
    backgroundColor: COLORS.charcoal,
    borderWidth: 1,
    borderColor: COLORS.grid,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 999,
  },
  toastText: {
    color: COLORS.lightGrey,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  keyboardContainer: {},
});
