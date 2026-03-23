import React, { useMemo } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { HOME_COLORS } from '../utils/colors';
import KalemahLogo from '../media/kalemah.svg';

type Stats = {
  gamesPlayed: number;
  gamesWon: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: number[];
  lastCompletedDayId?: string | null;
  lastWinDayId?: string | null;
};

type Mode = {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  status: 'available' | 'coming-soon';
  description: string;
  footer: string;
};

interface HomeScreenProps {
  stats: Stats;
  selectedModeId: string;
  onSelectMode: (modeId: string) => void;
  onOpenHelp: () => void;
  onOpenSettings: () => void;
  onStartMode: (modeId: string) => void;
}

const MODES: Mode[] = [
  {
    id: 'daily-wordle',
    title: 'الكلمة اليومية',
    subtitle: '',
    accent: HOME_COLORS.correct,
    status: 'available',
    description: 'لغز جديد كل يوم بخمس خانات.',
    footer: 'العب الجولة الحالية',
  },
  {
    id: 'archive',
    title: 'الأرشيف',
    subtitle: '',
    accent: HOME_COLORS.misplaced,
    status: 'coming-soon',
    description: 'ألغاز الأيام السابقة.',
    footer: 'قريباً',
  },
  {
    id: 'hard-mode',
    title: 'الوضع الصعب',
    subtitle: '',
    accent: HOME_COLORS.text,
    status: 'coming-soon',
    description: 'تحديات أصعب وقواعد أشد.',
    footer: 'قريباً',
  },
];

export function HomeScreen({
  stats,
  selectedModeId,
  onSelectMode,
  onOpenHelp,
  onOpenSettings,
  onStartMode,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const selectedIndex = Math.max(0, MODES.findIndex(mode => mode.id === selectedModeId));
  const selectedMode = MODES[selectedIndex] ?? MODES[0];
  const leftMode = MODES[(selectedIndex + MODES.length - 1) % MODES.length];
  const rightMode = MODES[(selectedIndex + 1) % MODES.length];
  const cardWidth = Math.min(width - 148, 292);

  const winRate = useMemo(() => {
    if (!stats.gamesPlayed) return 0;
    return Math.round((stats.gamesWon / stats.gamesPlayed) * 100);
  }, [stats.gamesPlayed, stats.gamesWon]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          Math.abs(gestureState.dx) > 14 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx <= -40) {
            onSelectMode(rightMode.id);
            return;
          }

          if (gestureState.dx >= 40) {
            onSelectMode(leftMode.id);
          }
        },
      }),
    [leftMode.id, onSelectMode, rightMode.id],
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.container}>
        <View style={styles.backgroundBase} />
        <View style={styles.backgroundTint} />

        <View style={[styles.headerBar, { marginTop: insets.top > 0 ? 6 : 14 }]}>
          <Pressable style={styles.topIconButton} onPress={onOpenHelp}>
            <MaterialCommunityIcons name="help-circle-outline" size={24} color={HOME_COLORS.text} />
          </Pressable>

          <View style={styles.headerLogoWrap}>
            <KalemahLogo width={164} height={62} />
          </View>

          <Pressable style={styles.topIconButton} onPress={onOpenSettings}>
            <MaterialCommunityIcons name="cog-outline" size={24} color={HOME_COLORS.text} />
          </Pressable>
        </View>

        <View style={styles.carouselWrap} {...panResponder.panHandlers}>
          <PreviewCard mode={leftMode} side="left" onPress={() => onSelectMode(leftMode.id)} />
          <PreviewCard mode={rightMode} side="right" onPress={() => onSelectMode(rightMode.id)} />

          <View style={styles.mainCardWrap}>
            <ModeCard
              mode={selectedMode}
              width={cardWidth}
              onPress={() => {
                if (selectedMode.status === 'available') {
                  onStartMode(selectedMode.id);
                }
              }}
            />
          </View>
        </View>

        <View style={styles.controlsWrap}>
          <View style={styles.pagination}>
            {MODES.map(mode => (
              <Pressable
                key={mode.id}
                onPress={() => onSelectMode(mode.id)}
                style={[
                  styles.paginationDot,
                  mode.id === selectedMode.id && [styles.paginationDotActive, { backgroundColor: mode.accent }],
                ]}
              />
            ))}
          </View>

          <Pressable
            onPress={() => selectedMode.status === 'available' && onStartMode(selectedMode.id)}
            style={[
              styles.primaryButton,
              { width: cardWidth },
              selectedMode.status !== 'available' && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {selectedMode.status === 'available' ? 'ابدأ اللعب' : 'هذا الوضع غير متاح بعد'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.statsBar}>
          <StatInline icon="fire" iconColor={HOME_COLORS.misplaced} label={`السلسلة: ${stats.currentStreak}`} />
          <View style={styles.statsDivider} />
          <StatInline icon="target" iconColor={HOME_COLORS.correct} label={`نسبة الربح: ${winRate}%`} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function PreviewCard({
  mode,
  side,
  onPress,
}: {
  mode: Mode;
  side: 'left' | 'right';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.sidePreviewCard,
        side === 'left' ? styles.sidePreviewLeft : styles.sidePreviewRight,
      ]}
    >
      <View style={styles.sidePreviewShine} />
      <View style={styles.sidePreviewInnerBorder} />
      <View style={styles.sidePreviewHeader}>
        <Text style={styles.sidePreviewTitle} numberOfLines={2}>
          {mode.title}
        </Text>
      </View>
      <Text style={styles.sidePreviewSubtitle} numberOfLines={2}>
        {mode.description}
      </Text>
      <View style={styles.sideMiniGrid}>
        {[0, 1].map(row => (
          <View key={row} style={styles.sideMiniRow}>
            {[0, 1, 2, 3].map(col => {
              const isCorrect = (row === 0 && col === 2) || (row === 1 && col === 1);
              const isMisplaced = row === 0 && col === 1;
              return (
                <View
                  key={col}
                  style={[
                    styles.sideMiniTile,
                    isCorrect && styles.previewTileCorrect,
                    isMisplaced && styles.previewTileMisplaced,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>
      <Text style={styles.sidePreviewFooter}>{mode.footer}</Text>
    </Pressable>
  );
}

function ModeCard({
  mode,
  width,
  onPress,
}: {
  mode: Mode;
  width: number;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.mainCard, { width }, { borderColor: withAlpha(HOME_COLORS.misplaced, 0.62) }]}>
      <View style={styles.mainCardOverlay} />
      <View style={styles.mainCardInnerBorder} />
      <View style={styles.mainCardTitleWrap}>
        <Text style={styles.mainCardTitle}>{mode.title}</Text>
        {mode.subtitle ? <Text style={styles.mainCardSubTitle}>{mode.subtitle}</Text> : <View style={styles.subtitleSpacer} />}
      </View>

      <View style={styles.previewGrid}>
        {[0, 1].map(row => (
          <View key={row} style={styles.previewRow}>
            {[0, 1, 2, 3, 4].map(col => {
              const isCorrect = row === 0 && (col === 0 || col === 2);
              const isMisplaced = (row === 0 && col === 1) || (row === 1 && col === 3);
              return (
                <View
                  key={col}
                  style={[
                    styles.previewTile,
                    isCorrect && styles.previewTileCorrect,
                    isMisplaced && styles.previewTileMisplaced,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      <Text style={styles.mainDescription}>{mode.description}</Text>

      <View style={styles.mainFooter}>
        <Text style={styles.mainFooterText}>{mode.footer}</Text>
      </View>
    </Pressable>
  );
}

function StatInline({
  icon,
  iconColor,
  label,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  iconColor: string;
  label: string;
}) {
  return (
    <View style={styles.statInline}>
      <MaterialCommunityIcons name={icon} size={22} color={iconColor} />
      <Text style={styles.statInlineText}>{label}</Text>
    </View>
  );
}

function withAlpha(hex: string, alpha: number) {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: HOME_COLORS.background,
    paddingHorizontal: 22,
    paddingBottom: 20,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  backgroundBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: HOME_COLORS.background,
  },
  backgroundTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.01),
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.03),
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.05),
  },
  topIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: withAlpha(HOME_COLORS.text, 0.04),
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.06),
  },
  headerLogoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  carouselWrap: {
    height: 372,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -14,
  },
  mainCardWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidePreviewCard: {
    position: 'absolute',
    top: 82,
    width: 140,
    minHeight: 246,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.03),
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.08),
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: HOME_COLORS.background,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    overflow: 'hidden',
  },
  sidePreviewLeft: {
    left: -8,
    transform: [{ rotate: '-8deg' }],
  },
  sidePreviewRight: {
    right: -8,
    transform: [{ rotate: '8deg' }],
  },
  sidePreviewShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '46%',
    backgroundColor: withAlpha(HOME_COLORS.text, 0.02),
  },
  sidePreviewInnerBorder: {
    position: 'absolute',
    top: 7,
    left: 7,
    right: 7,
    bottom: 7,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.04),
  },
  sidePreviewHeader: {
    paddingTop: 2,
  },
  sidePreviewTitle: {
    color: HOME_COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 24,
  },
  sidePreviewSubtitle: {
    color: withAlpha(HOME_COLORS.text, 0.75),
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
    minHeight: 34,
  },
  sideMiniGrid: {
    alignSelf: 'center',
    gap: 6,
    marginTop: 4,
  },
  sideMiniRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sideMiniTile: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: HOME_COLORS.surface,
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.05),
  },
  sidePreviewFooter: {
    color: HOME_COLORS.text,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  mainCard: {
    minHeight: 314,
    borderRadius: 26,
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: withAlpha(HOME_COLORS.background, 0.94),
    borderWidth: 1,
    shadowColor: HOME_COLORS.background,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.34,
    shadowRadius: 22,
    justifyContent: 'space-between',
  },
  mainCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 26,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.012),
  },
  mainCardInnerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.04),
  },
  mainCardTitleWrap: {
    alignItems: 'center',
    paddingTop: 6,
  },
  mainCardTitle: {
    color: HOME_COLORS.text,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  mainCardSubTitle: {
    color: withAlpha(HOME_COLORS.text, 0.82),
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginTop: 4,
  },
  subtitleSpacer: {
    height: 16,
  },
  previewGrid: {
    alignSelf: 'center',
    gap: 9,
  },
  previewRow: {
    flexDirection: 'row',
    gap: 7,
  },
  previewTile: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: HOME_COLORS.surface,
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.05),
  },
  previewTileCorrect: {
    backgroundColor: HOME_COLORS.correct,
  },
  previewTileMisplaced: {
    backgroundColor: HOME_COLORS.misplaced,
  },
  mainDescription: {
    color: HOME_COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  mainFooter: {
    borderTopWidth: 1,
    borderTopColor: withAlpha(HOME_COLORS.text, 0.07),
    paddingTop: 12,
    alignItems: 'center',
  },
  mainFooterText: {
    color: HOME_COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
  controlsWrap: {
    alignItems: 'center',
    marginTop: -42,
    gap: 18,
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 9,
    marginTop: -10,
  },
  paginationDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.3),
  },
  paginationDotActive: {
    width: 12,
  },
  primaryButton: {
    backgroundColor: HOME_COLORS.correct,
    borderRadius: 18,
    alignSelf: 'center',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: HOME_COLORS.background,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    borderWidth: 1,
    borderColor: withAlpha(HOME_COLORS.text, 0.12),
  },
  primaryButtonDisabled: {
    backgroundColor: withAlpha(HOME_COLORS.surface, 0.92),
  },
  primaryButtonText: {
    color: HOME_COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: withAlpha(HOME_COLORS.text, 0.08),
    paddingTop: 16,
    marginTop: -20,
  },
  statsDivider: {
    width: 1,
    height: 24,
    marginHorizontal: 18,
    backgroundColor: withAlpha(HOME_COLORS.text, 0.14),
  },
  statInline: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  statInlineText: {
    color: HOME_COLORS.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
