import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useGameStore } from '../stores/gameStore';
import { generatePuzzle, generateDailyPuzzle, Difficulty } from '../packages/engine';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function GameScreen() {
  const { difficulty } = useLocalSearchParams<{ difficulty: string }>();
  const router = useRouter();
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const newGame = useGameStore((s) => s.newGame);
  const tick = useGameStore((s) => s.tick);
  const elapsedSeconds = useGameStore((s) => s.elapsedSeconds);
  const mistakes = useGameStore((s) => s.mistakes);
  const isComplete = useGameStore((s) => s.isComplete);
  const isHardMode = useGameStore((s) => s.isHardMode);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const isDaily = difficulty === 'daily';
    const puzzle = isDaily
      ? generateDailyPuzzle(new Date())
      : generatePuzzle((difficulty as Difficulty) ?? 'medium');

    newGame(puzzle.board as any, puzzle.solution as any, puzzle.difficulty);

    timerRef.current = setInterval(() => tick(), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (isComplete) {
      if (timerRef.current) clearInterval(timerRef.current);
      Alert.alert(
        'Solved!',
        `Time: ${formatTime(elapsedSeconds)}${!isHardMode ? `\nMistakes: ${mistakes}` : ''}`,
        [{ text: 'Back to Menu', onPress: () => router.back() }]
      );
    }
  }, [isComplete]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.backText, { color: C.textMuted, fontFamily: Typography.mono }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <Text style={[styles.timer, { color: C.text, fontFamily: Typography.monoBold }]}>
          {formatTime(elapsedSeconds)}
        </Text>
        {!isHardMode && (
          <Text style={[styles.mistakes, { color: mistakes > 0 ? C.error : C.textMuted, fontFamily: Typography.mono }]}>
            {mistakes} err
          </Text>
        )}
        {isHardMode && (
          <Text style={[styles.hardBadge, { color: C.accent, fontFamily: Typography.mono }]}>
            HARD
          </Text>
        )}
      </View>

      <View style={styles.boardContainer}>
        <SudokuBoard />
      </View>

      <NumberPad />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  backButton: {
    padding: Spacing.sm,
  },
  backText: {
    fontSize: 14,
  },
  timer: {
    fontSize: 22,
    letterSpacing: 2,
  },
  mistakes: {
    fontSize: 14,
    minWidth: 50,
    textAlign: 'right',
  },
  hardBadge: {
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  boardContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
