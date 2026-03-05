import { Modal, View, Text, StyleSheet, Pressable, ScrollView, useWindowDimensions } from 'react-native';
import { COLORS } from '../utils/colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Stats {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[]; // length 6
  lastCompletedDayId?: string | null;
  lastWinDayId?: string | null;
}

interface StatsModalProps {
  visible: boolean;
  stats: Stats;
  onClose: () => void;
}

export function StatsModal({ visible, stats, onClose }: StatsModalProps) {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const modalMaxHeight = height - insets.top - insets.bottom - 24;

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

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={[styles.overlay, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
        <View style={[styles.modal, { maxHeight: modalMaxHeight }]}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
          <Text style={styles.title}>إحصائياتك</Text>

          {/* ====== STATS SUMMARY ====== */}
          <View style={styles.statsRow}>
            <StatBlock label="لعبت" value={safeStats.gamesPlayed} />
            <StatBlock label="نسبة الفوز" value={`${winPercent}%`} />
            <StatBlock label="السلسلة الحالية" value={safeStats.currentStreak} />
            <StatBlock label="أفضل سلسلة" value={safeStats.maxStreak} />
          </View>

          {/* ====== DISTRIBUTION ====== */}
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

          <Pressable onPress={onClose} style={styles.button}>
            <Text style={styles.buttonText}>حسناً</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function StatBlock({ label, value }: { label: string; value: any }) {
  return (
    <View style={styles.statBlock}>
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
    marginBottom: 16,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  statBlock: {
    alignItems: 'center',
    flex: 1,
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
  },
  barBackground: {
    flex: 1,
    backgroundColor: 'rgba(218, 220, 224, 0.03)',
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    backgroundColor: COLORS.lightGrey,
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  barText: {
    color: COLORS.charcoal,
    fontSize: 12,
    fontWeight: 'bold',
  },

  button: {
    backgroundColor: COLORS.lightGrey,
    paddingVertical: 10,
    paddingHorizontal: 32,
    borderRadius: 6,
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.charcoal,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
