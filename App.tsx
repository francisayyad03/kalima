import { View, StyleSheet, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
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

  const [showModal, setShowModal] = useState(true);
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

  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= 768;
  const isSmallPhone = !isTablet && height <= 700;
  const isLargePhone = !isTablet && !isSmallPhone;

  const iconSize = isTablet ? 30 : isSmallPhone ? 20 : 22;

  const ROWS = 6;
  const COLS = 5;
  const boardGap = isTablet ? 10 : 6;
  const boardMaxWidth = width * (isTablet ? 0.75 : 0.92);
  const boardMaxHeight = height * (isTablet ? 0.62 : 0.50);
  const tileByWidth = Math.floor((boardMaxWidth - boardGap * (COLS - 1)) / COLS);
  const tileByHeight = Math.floor((boardMaxHeight - boardGap * (ROWS - 1)) / ROWS);
  let tileSize = Math.min(tileByWidth, tileByHeight);
  tileSize = isTablet
    ? Math.max(56, Math.min(tileSize, 90))
    : Math.max(40, Math.min(tileSize, 56));
  const headerWidth = tileSize * COLS + boardGap * (COLS - 1);

  const pillPadV = isTablet ? 16 : 10;
  const pillPadH = isTablet ? 22 : 14;
  const circleSize = isTablet ? 48 : 36;
  const circleRadius = circleSize / 2;
  const logoWidth = isTablet ? 240 : isSmallPhone ? 130 : 150;
  const logoHeight = isTablet ? 56 : 30;

  const safeTop = isTablet ? insets.top : Math.min(insets.top, 20);
  const headerTopPad = safeTop + (isSmallPhone ? 8 : isLargePhone ? 0 : 10);
  const boardTopPad = isSmallPhone ? 0 : isLargePhone ? 4 : 10;

  const boardBottomPad = isLargePhone ? 20 : 8;

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
      <View style={[styles.headerWrap, { paddingTop: headerTopPad }]}>
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
      <View style={[styles.boardContainer, { paddingTop: boardTopPad, paddingBottom: boardBottomPad }]}>
        <Board
          guesses={game.guesses}
          results={game.results}
          currentGuess={game.currentGuess}
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
          answer={game.answer}
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
    elevation: 3,
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
