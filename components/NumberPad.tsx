import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, Spacing } from '../constants/theme';
import { useGameStore } from '../stores/gameStore';

export default function NumberPad() {
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const isNotesMode = useGameStore((s) => s.isNotesMode);
  const isHardMode = useGameStore((s) => s.isHardMode);
  const placeNumber = useGameStore((s) => s.placeNumber);
  const toggleNote = useGameStore((s) => s.toggleNote);
  const toggleNotesMode = useGameStore((s) => s.toggleNotesMode);
  const undo = useGameStore((s) => s.undo);

  const handleNumber = (n: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (isNotesMode && !isHardMode) {
      toggleNote(n);
    } else {
      placeNumber(n as any);
    }
  };

  const handleErase = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    placeNumber(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <ActionButton label="Undo" onPress={undo} color={C.textMuted} />
        {!isHardMode && (
          <ActionButton
            label={isNotesMode ? 'Notes ON' : 'Notes'}
            onPress={toggleNotesMode}
            color={isNotesMode ? C.accent : C.textMuted}
          />
        )}
        <ActionButton label="Erase" onPress={handleErase} color={C.textMuted} />
      </View>
      <View style={styles.grid}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.numButton, { backgroundColor: C.surface, borderColor: C.border }]}
            onPress={() => handleNumber(n)}
            activeOpacity={0.7}
          >
            <Text style={[styles.numText, { color: C.text, fontFamily: Typography.monoBold }]}>
              {n}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ActionButton({ label, onPress, color }: { label: string; onPress: () => void; color: string }) {
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];
  return (
    <TouchableOpacity onPress={onPress} style={styles.actionButton} activeOpacity={0.7}>
      <Text style={[styles.actionText, { color, fontFamily: Typography.mono }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    padding: Spacing.sm,
  },
  actionText: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  numButton: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 24,
  },
});
