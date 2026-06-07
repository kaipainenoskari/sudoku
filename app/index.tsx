import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors, Typography, Spacing } from '../constants/theme';
import { Difficulty, DIFFICULTY_LABELS } from '../packages/engine';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const startGame = (difficulty: Difficulty) => {
    router.push({ pathname: '/game', params: { difficulty } });
  };

  const startDaily = () => {
    router.push({ pathname: '/game', params: { difficulty: 'daily' } });
  };

  return (
    <View style={[styles.container, { backgroundColor: C.background }]}>
      <Text style={[styles.title, { color: C.text, fontFamily: Typography.monoBold }]}>
        Sudoku+
      </Text>
      <Text style={[styles.subtitle, { color: C.textMuted, fontFamily: Typography.mono }]}>
        No ads. Just sudoku.
      </Text>

      <TouchableOpacity
        style={[styles.dailyButton, { backgroundColor: C.accent }]}
        onPress={startDaily}
        activeOpacity={0.85}
      >
        <Text style={[styles.dailyText, { fontFamily: Typography.monoBold }]}>Daily Puzzle</Text>
      </TouchableOpacity>

      <View style={styles.dividerRow}>
        <View style={[styles.divider, { backgroundColor: C.border }]} />
        <Text style={[styles.dividerLabel, { color: C.textMuted, fontFamily: Typography.mono }]}>
          or choose difficulty
        </Text>
        <View style={[styles.divider, { backgroundColor: C.border }]} />
      </View>

      <View style={styles.difficultyList}>
        {DIFFICULTIES.map((d) => (
          <TouchableOpacity
            key={d}
            style={[styles.difficultyButton, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => startGame(d)}
            activeOpacity={0.8}
          >
            <Text style={[styles.difficultyText, { color: C.text, fontFamily: Typography.mono }]}>
              {DIFFICULTY_LABELS[d]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.statsButton}
        onPress={() => router.push('/stats')}
        activeOpacity={0.7}
      >
        <Text style={[styles.statsText, { color: C.textMuted, fontFamily: Typography.mono }]}>
          Stats
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 42,
    letterSpacing: -1,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.xxl,
  },
  dailyButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dailyText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: 12,
  },
  difficultyList: {
    width: '100%',
    gap: Spacing.sm,
  },
  difficultyButton: {
    width: '100%',
    paddingVertical: Spacing.sm + 4,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  difficultyText: {
    fontSize: 15,
  },
  statsButton: {
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  statsText: {
    fontSize: 14,
  },
});
