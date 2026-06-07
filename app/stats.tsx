import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useGameStore } from '../stores/gameStore';
import type { Difficulty } from '../stores/gameStore';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];
const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
  expert: 'Expert',
  evil: 'Evil',
};

function formatTime(seconds: number | null): string {
  if (seconds === null) return '--:--';
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function StatsScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const streak = useGameStore((s) => s.streak);
  const totalSolves = useGameStore((s) => s.totalSolves);
  const bestTimes = useGameStore((s) => s.bestTimes);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: C.textMuted, fontFamily: Typography.mono }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: C.text, fontFamily: Typography.monoBold }]}>
          Stats
        </Text>
        <View style={styles.backButton} />
      </View>

      <View style={styles.content}>
        <View style={styles.statRow}>
          <View style={[styles.statCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.statValue, { color: C.accent, fontFamily: Typography.monoBold }]}>
              {streak}
            </Text>
            <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: Typography.mono }]}>
              day streak
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: C.surface, borderColor: C.border }]}>
            <Text style={[styles.statValue, { color: C.accent, fontFamily: Typography.monoBold }]}>
              {totalSolves}
            </Text>
            <Text style={[styles.statLabel, { color: C.textMuted, fontFamily: Typography.mono }]}>
              total solves
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: C.textMuted, fontFamily: Typography.mono }]}>
          personal bests
        </Text>

        <View style={styles.bestList}>
          {DIFFICULTIES.map((d) => (
            <View
              key={d}
              style={[styles.bestRow, { backgroundColor: C.surface, borderColor: C.border }]}
            >
              <Text style={[styles.bestLabel, { color: C.text, fontFamily: Typography.mono }]}>
                {DIFFICULTY_LABELS[d]}
              </Text>
              <Text
                style={[
                  styles.bestTime,
                  {
                    color: bestTimes[d] !== null ? C.accent : C.textMuted,
                    fontFamily: Typography.monoBold,
                  },
                ]}
              >
                {formatTime(bestTimes[d])}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: Spacing.sm,
    minWidth: 60,
  },
  backText: {
    fontSize: 14,
  },
  title: {
    fontSize: 20,
    letterSpacing: -0.5,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statValue: {
    fontSize: 40,
    lineHeight: 44,
  },
  statLabel: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  bestList: {
    gap: Spacing.sm,
  },
  bestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
  },
  bestLabel: {
    fontSize: 15,
  },
  bestTime: {
    fontSize: 15,
    letterSpacing: 1,
  },
});
