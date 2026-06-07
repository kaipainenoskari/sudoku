import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useColorScheme } from 'react-native';
import { Colors, BoardSize } from '../constants/theme';

const { cellSize, gap } = BoardSize;
const BOARD_SIZE = cellSize * 9 + gap * 8;
const STAGGER_MS = 20;
const TOTAL_CELLS = 81;
const FADE_DURATION = 200;

interface Props {
  visible: boolean;
  onComplete: () => void;
}

export default function SolveWave({ visible, onComplete }: Props) {
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const anims = useRef<Animated.Value[]>(
    Array.from({ length: TOTAL_CELLS }, () => new Animated.Value(0))
  ).current;

  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!visible || hasAnimated.current) return;
    hasAnimated.current = true;

    // Reset all
    anims.forEach((a) => a.setValue(0));

    const animations = anims.map((anim, i) =>
      Animated.sequence([
        Animated.delay(i * STAGGER_MS),
        Animated.timing(anim, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(animations).start(() => {
      onComplete();
    });
  }, [visible, anims, onComplete]);

  // Reset for next game
  useEffect(() => {
    if (!visible) {
      hasAnimated.current = false;
      anims.forEach((a) => a.setValue(0));
    }
  }, [visible, anims]);

  if (!visible) return null;

  return (
    <View style={[styles.overlay, { width: BOARD_SIZE, height: BOARD_SIZE }]} pointerEvents="none">
      {Array.from({ length: 9 }, (_, r) => (
        <View key={r} style={styles.row}>
          {Array.from({ length: 9 }, (__, c) => {
            const idx = r * 9 + c;
            return (
              <Animated.View
                key={c}
                style={[
                  styles.cell,
                  {
                    backgroundColor: C.success,
                    opacity: anims[idx],
                  },
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: cellSize,
    height: cellSize,
  },
});
