import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors, Typography, Spacing } from '../constants/theme';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

interface ResultModalProps {
  visible: boolean;
  elapsedSeconds: number;
  mistakes: number;
  isHardMode: boolean;
  isNewBest: boolean;
  streak: number;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function ResultModal({
  visible,
  elapsedSeconds,
  mistakes,
  isHardMode,
  isNewBest,
  streak,
  onPlayAgain,
  onMenu,
}: ResultModalProps) {
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.85)' }]}>
        <View style={[styles.card, { backgroundColor: C.surface, borderColor: C.border }]}>
          <Text style={[styles.solvedLabel, { color: C.textMuted, fontFamily: Typography.mono }]}>
            puzzle solved
          </Text>

          <Text style={[styles.time, { color: C.text, fontFamily: Typography.monoBold }]}>
            {formatTime(elapsedSeconds)}
          </Text>

          {isNewBest && (
            <Text style={[styles.newBest, { color: C.accent, fontFamily: Typography.monoBold }]}>
              New best!
            </Text>
          )}

          {!isHardMode && (
            <Text
              style={[
                styles.mistakes,
                { color: mistakes > 0 ? C.error : C.textMuted, fontFamily: Typography.mono },
              ]}
            >
              {mistakes} {mistakes === 1 ? 'mistake' : 'mistakes'}
            </Text>
          )}

          <Text style={[styles.streak, { color: C.textMuted, fontFamily: Typography.mono }]}>
            {streak} day streak
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: C.accent }]}
              onPress={onPlayAgain}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryButtonText, { fontFamily: Typography.monoBold }]}>
                Play again
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: C.surfaceAlt, borderColor: C.border },
              ]}
              onPress={onMenu}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.secondaryButtonText, { color: C.text, fontFamily: Typography.mono }]}
              >
                Back to menu
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
  },
  solvedLabel: {
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: 52,
    letterSpacing: 2,
    lineHeight: 58,
  },
  newBest: {
    fontSize: 15,
    letterSpacing: 0.5,
    marginTop: Spacing.xs,
  },
  mistakes: {
    fontSize: 14,
  },
  streak: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  buttons: {
    width: '100%',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
  },
});
