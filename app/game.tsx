import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import ConfettiCannon from 'react-native-confetti-cannon';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useGameStore, Board } from '../stores/gameStore';
import { generatePuzzle, generateDailyPuzzle, Difficulty } from '../packages/engine';
import SudokuBoard from '../components/SudokuBoard';
import NumberPad from '../components/NumberPad';
import ResultModal from '../components/ResultModal';
import SolveWave from '../components/SolveWave';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
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
  const streak = useGameStore((s) => s.streak);
  const bestTimes = useGameStore((s) => s.bestTimes);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [isNewBest, setIsNewBest] = useState(false);
  const [showWave, setShowWave] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const confettiRef = useRef<ConfettiCannon>(null);
  const prevBestRef = useRef<number | null>(null);

  const startPuzzle = () => {
    const isDaily = difficulty === 'daily';
    const puzzle = isDaily
      ? generateDailyPuzzle(new Date())
      : generatePuzzle((difficulty as Difficulty) ?? 'medium');

    setIsNewBest(false);
    setShowWave(false);
    setShowModal(false);

    if (!isDaily) {
      const diff = (difficulty as Difficulty) ?? 'medium';
      prevBestRef.current = bestTimes[diff];
    } else {
      prevBestRef.current = null;
    }

    newGame(puzzle.board as Board, puzzle.solution as Board, puzzle.difficulty);
  };

  useEffect(() => {
    startPuzzle();
    timerRef.current = setInterval(() => tick(), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isComplete) {
      if (!useGameStore.getState().isComplete) return;
      if (timerRef.current) clearInterval(timerRef.current);
      const prev = prevBestRef.current;
      const improved = prev === null || elapsedSeconds < prev;
      setIsNewBest(improved);
      setShowWave(true);
    }
  }, [isComplete]);

  const handleWaveComplete = () => {
    setShowWave(false);
    if (isNewBest) {
      confettiRef.current?.start();
    }
    // Short delay so confetti is visible before modal
    setTimeout(() => {
      setShowModal(true);
    }, 600);
  };

  const handlePlayAgain = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    startPuzzle();
    timerRef.current = setInterval(() => tick(), 1000);
  };

  const handleMenu = () => {
    router.back();
  };

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
          <Text
            style={[
              styles.mistakes,
              { color: mistakes > 0 ? C.error : C.textMuted, fontFamily: Typography.mono },
            ]}
          >
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
        <SolveWave visible={showWave} onComplete={handleWaveComplete} />
      </View>

      <NumberPad />

      <ConfettiCannon
        ref={confettiRef}
        count={150}
        origin={{ x: -10, y: 0 }}
        autoStart={false}
        fadeOut
      />

      <ResultModal
        visible={showModal}
        elapsedSeconds={elapsedSeconds}
        mistakes={mistakes}
        isHardMode={isHardMode}
        isNewBest={isNewBest}
        streak={streak}
        onPlayAgain={handlePlayAgain}
        onMenu={handleMenu}
      />
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
