import { Modal, View, Text, StyleSheet, Pressable, Share, ScrollView, useWindowDimensions, PixelRatio, Linking } from 'react-native';
import type { TileResult, TileState } from '../game/types';
import { COLORS } from '../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastCompletedDayId?: string | null;
  lastWinDayId?: string | null;
}

interface GameOverModalProps {
  visible: boolean;
  status: 'won' | 'lost';
  answer: string;
  stats: Stats;
  results: TileResult[][];
  onClose: () => void;
}

export function GameOverModal({
  visible,
  status,
  answer,
  stats,
  results,
  onClose,
}: GameOverModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const modalMaxHeight = height - insets.top - insets.bottom - 24;
  const useWrappedStats = PixelRatio.getFontScale() >= 1.2;
  const isWin = status === 'won';

  const safeStats = stats ?? {
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: [0, 0, 0, 0, 0, 0],
  };
  const winPercent =
    safeStats.gamesPlayed === 0
      ? 0
      : Math.round((safeStats.gamesWon / safeStats.gamesPlayed) * 100);

  const maxDist = Math.max(...safeStats.guessDistribution, 1);

  function stateToEmoji(state: TileState) {
    if (state === 'correct') return '🟩';
    if (state === 'present') return '🟨';
    if (state === 'absent') return '🟥';
    return '⬛';
  }

  function buildShareText() {
    const guessesUsed = results?.length ?? 0;
    const score = isWin ? `${guessesUsed}/6` : 'X/6';

    const grid = (results ?? [])
      .map(row =>
        [...row]
          .reverse()
          .map(tile => stateToEmoji(tile.state))
          .join('')
      )
      .join('\n');

    const formatDayForShare = (dayId: string) =>
      dayId
        .split('')
        // Prevent apps like WhatsApp from auto-linking as a phone/number.
        .map((ch) => (/\d/.test(ch) ? `${ch}\u2060` : ch))
        .join('');

    const day = safeStats.lastCompletedDayId ? ` ${formatDayForShare(safeStats.lastCompletedDayId)}` : '';

    return `Kalima${day} ${score}\n\n${grid}`;
  }

  async function onShare() {
    try {
      const message = buildShareText();
      await Share.share({ message });
    } catch (e) {
      console.log('Share failed:', e);
    }
  }

  async function openDictionaryForAnswer() {
    const url = `https://www.almaany.com/ar/dict/ar-ar/${encodeURIComponent(answer)}/`;
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.log('Open dictionary failed:', e);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
          <Text style={styles.title}>
            {isWin ? '🎉 فزت!' : '😔 انتهت اللعبة'}
          </Text>

          <Text style={styles.subtitle}>الكلمة كانت</Text>
          <Pressable onPress={openDictionaryForAnswer} accessibilityRole="link" style={styles.answerPressable}>
            <Text style={styles.answer}>{answer}</Text>
            <Text style={[styles.subtitle, styles.answerHint]}>{`>> ما معنى كلمة ${answer}؟`}</Text>
          </Pressable>

          {/* STATS SUMMARY */}
          <View style={[styles.statsRow, useWrappedStats && styles.statsRowWrapped]}>
            <StatBlock label="لعبت" value={safeStats.gamesPlayed} wrapped={useWrappedStats} />
            <StatBlock label="نسبة الفوز" value={`${winPercent}%`} wrapped={useWrappedStats} />
            <StatBlock label="السلسلة الحالية" value={safeStats.currentStreak} wrapped={useWrappedStats} />
            <StatBlock label="أفضل سلسلة" value={safeStats.maxStreak} wrapped={useWrappedStats} />
          </View>

          {/* DISTRIBUTION */}
          <View style={styles.distributionContainer}>
            {safeStats.guessDistribution.map((count, index) => {
              const widthPercent = (count / maxDist) * 100;
              return (
                <View key={index} style={styles.distRow}>
                  <Text style={styles.distLabel}>{index + 1}</Text>
                  <View style={styles.barBackground}>
                    {count > 0 && (
                    <View style={[styles.barFill, { width: `${widthPercent}%` }]}>
                      <Text style={styles.barText}>{count}</Text>
                    </View>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
          </ScrollView>

          {/* BUTTONS */}
          <View style={styles.buttonRow}>
            <Pressable onPress={onShare} style={styles.shareButton}>
              <Text style={styles.shareButtonText}>مشاركة</Text>
            </Pressable>

            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>موافق</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function StatBlock({
  label,
  value,
  wrapped,
}: {
  label: string;
  value: any;
  wrapped: boolean;
}) {
  return (
    <View style={[styles.statBlock, wrapped && styles.statBlockWrapped]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 18, 17, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: COLORS.charcoal,
    borderRadius: 12,
    padding: 24,
    width: '92%',
    alignItems: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  title: {
    color: COLORS.lightGrey,
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    color: COLORS.lightGrey,
    fontSize: 14,
    marginBottom: 4,
  },
  answer: {
    color: COLORS.lightGrey,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 0,
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  answerHint: {
    marginBottom: 10,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  answerPressable: {
    alignSelf: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statsRowWrapped: {
    flexWrap: 'wrap',
    rowGap: 10,
  },
  statBlock: {
    alignItems: 'center',
    width: '25%',
    paddingHorizontal: 4,
  },
  statBlockWrapped: {
    width: '50%',
    paddingHorizontal: 6,
  },
  statValue: {
    color: COLORS.lightGrey,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: COLORS.lightGrey,
    fontSize: 11,
    textAlign: 'center',
    flexShrink: 1,
  },

  distributionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  distRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  distLabel: {
    color: COLORS.lightGrey,
    width: 20,
    textAlign: 'center',
  },
  barBackground: {
    flex: 1,
    backgroundColor: 'rgba(218, 220, 224, 0.03)',
    minHeight: 24,
    borderRadius: 4,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  barFill: {
    backgroundColor: COLORS.lightGrey,
    minHeight: 24,
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  barText: {
    color: COLORS.charcoal,
    fontSize: 12,
    fontWeight: 'bold',
  },

  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 10,
  },
  shareButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: COLORS.grid,
  },
  shareButtonText: {
    color: COLORS.lightGrey,
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    backgroundColor: COLORS.lightGrey,
  },
  closeButtonText: {
    color: COLORS.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
