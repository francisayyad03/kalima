import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions, Platform } from 'react-native';
import { useGame } from './src/game/useGame';
import { Board } from './src/components/board';
import { Keyboard } from './src/components/keyboard';
import { getKeyboardState } from './src/game/keyboardState';
import { GameOverModal } from './src/components/GameOverModal';
import { useState, useEffect, useRef } from 'react';
import { StatsModal } from './src/components/statsModal';
import { HelpModal } from './src/components/helpModal';
import { COLORS } from './src/utils/colors';
import { hasSeenHelpModal, markHelpModalSeen } from './src/game/storage';
import {
  setupReminderNotificationsAsync,
  // showcaseAllReminderMessagesForTestingAsync,
} from './src/notifications/reminders';
import {
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaProvider,
} from 'react-native-safe-area-context';

import HelpIcon from './src/media/help.svg';
import StatsIcon from './src/media/stats.svg';
import KalemahLogo from './src/media/kalemah.svg';
import { LoadingScreen } from './src/components/loadingScreen';

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void setupReminderNotificationsAsync();
    // if (__DEV__) {
    //   void showcaseAllReminderMessagesForTestingAsync();
    // }
  }, []);

  return (
    <SafeAreaProvider>
      {!isReady ? (
        <LoadingScreen onFinish={() => setIsReady(true)} />
      ) : (
        <AppInner />
      )}
    </SafeAreaProvider>
  );
}

function AppInner() {
  const game = useGame();
  const keyStates = getKeyboardState(game.results);

  const [showModal, setShowModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const openHelpOnFirstLaunch = async () => {
      try {
        const seen = await hasSeenHelpModal();
        if (!seen) {
          await markHelpModalSeen();
          if (isMounted) setShowHelp(true);
        }
      } catch {
      }
    };

    void openHelpOnFirstLaunch();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (game.status !== 'playing') {
      void setupReminderNotificationsAsync();
    }
  }, [game.status]);

  useEffect(() => {
    if (game.status === 'playing') {
      setShowModal(false);
      return;
    }

    setShowModal(false);
    const delayMs = game.status === 'lost' ? 500 : 1000;
    const timer = setTimeout(() => setShowModal(true), delayMs);
    return () => clearTimeout(timer);
  }, [game.status]);

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
  const boardMaxHeight = height * (isTablet ? (isAndroidTablet ? 0.50 : 0.62) : isAndroidWide ? 0.54 : 0.50);
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
  const baseLogoWidth = isTablet ? (isAndroidTablet ? 210 : 240) : isAndroidWide ? 170 : isSmallPhone ? 130 : 150;
  const logoWidth = Platform.OS === 'android'
    ? Math.min(baseLogoWidth, Math.max(112, headerWidth - (circleSize * 2) - (pillPadH * 2) - 24))
    : baseLogoWidth;
  const logoHeight = isTablet ? (isAndroidTablet ? 50 : 56) : isAndroidWide ? 36 : 30;

  const safeTop = Math.max(0, Math.min(insets.top, 20));
  const headerTopPad =
    safeTop + (isSmallPhone ? 8 : isLargePhone ? 0 : isAndroidWide ? 0 : 10) + (isAndroidPhone ? 14 : 0);
  const boardTopPad =
    (isSmallPhone ? 0 : isLargePhone ? 4 : isAndroidWide ? 6 : 10) + (isAndroidPhone ? 4 : 0);
  const boardBottomPad = isLargePhone ? 20 : 8;
  const headerLift = isAndroidSmallPhone ? -36 : isAndroidTablet ? -24 : isAndroidWide ? -12 : 0;
  const boardLift = isAndroidSmallPhone ? -8 : 0;

  // ===== TOAST =====
  const [toastMessage, setToastMessage] = useState<string | null>(null);
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
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* HEADER */}
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

      {/* TOAST */}
      {toastMessage && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* BOARD */}
      <View style={[styles.boardContainer, { paddingTop: boardTopPad, paddingBottom: boardBottomPad, marginTop: boardLift }]}>
        <Board
          guesses={game.guesses}
          results={game.results}
          currentGuess={game.currentGuess}
          status={game.status}
        />
      </View>

      {/* KEYBOARD */}
      <View style={[styles.keyboardContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Keyboard
          onKey={game.addLetter}
          onEnter={() => {
            if (game.currentGuess.length !== 5) return;
            const ok = game.submitGuess();
            if (!ok) showToast('الكلمة غير موجودة في القائمة');
          }}
          onBackspace={game.removeLetter}
          keyStates={keyStates}
        />
      </View>

      {/* GAME OVER MODAL */}
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

      {/* HELP MODAL */}
      <HelpModal visible={showHelp} onClose={() => setShowHelp(false)} />

      {/* STATS MODAL */}
      <StatsModal visible={showStats} stats={game.stats} onClose={() => setShowStats(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.charcoal,
  },

  // ===== HEADER =====
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(218, 220, 224, 0.06)',
  },

  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoWrap: {
    flex: 1,
    alignItems: 'center',
  },

  // ===== TOAST =====
  toast: {
    position: 'absolute',
    top: 110,
    alignSelf: 'center',
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#3A3A3A',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 999,
  },

  toastText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ===== LAYOUT =====
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  keyboardContainer: {},
});
