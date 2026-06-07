import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Typography, BoardSize } from '../constants/theme';
import { useGameStore } from '../stores/gameStore';

const { cellSize, gap } = BoardSize;

function isSameBox(r1: number, c1: number, r2: number, c2: number) {
  return Math.floor(r1 / 3) === Math.floor(r2 / 3) && Math.floor(c1 / 3) === Math.floor(c2 / 3);
}

export default function SudokuBoard() {
  const scheme = useColorScheme() ?? 'dark';
  const C = Colors[scheme];

  const board = useGameStore((s) => s.board);
  const solution = useGameStore((s) => s.solution);
  const given = useGameStore((s) => s.given);
  const notes = useGameStore((s) => s.notes);
  const selected = useGameStore((s) => s.selected);
  const isHardMode = useGameStore((s) => s.isHardMode);
  const conflictCells = useGameStore((s) => s.conflictCells);
  const lastCorrectCell = useGameStore((s) => s.lastCorrectCell);
  const completedRegionCells = useGameStore((s) => s.completedRegionCells);
  const setSelected = useGameStore((s) => s.setSelected);

  // --- Shake animation for conflict cells ---
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const prevConflictRef = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    if (conflictCells.length > 0 && prevConflictRef.current.length === 0) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 4, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]).start();
    }
    prevConflictRef.current = conflictCells;
  }, [conflictCells, shakeAnim]);

  // --- Pop animation for correct placement ---
  const popAnim = useRef(new Animated.Value(1)).current;
  const prevCorrectRef = useRef<[number, number] | null>(null);

  useEffect(() => {
    if (lastCorrectCell !== null && prevCorrectRef.current === null) {
      popAnim.setValue(1);
      Animated.sequence([
        Animated.timing(popAnim, { toValue: 1.15, duration: 75, useNativeDriver: true }),
        Animated.timing(popAnim, { toValue: 1, duration: 75, useNativeDriver: true }),
      ]).start();
    }
    prevCorrectRef.current = lastCorrectCell;
  }, [lastCorrectCell, popAnim]);

  // --- Flash animation for completed regions ---
  const flashAnim = useRef(new Animated.Value(0)).current;
  const prevRegionRef = useRef<Array<[number, number]>>([]);

  useEffect(() => {
    if (completedRegionCells.length > 0 && prevRegionRef.current.length === 0) {
      flashAnim.setValue(0);
      Animated.sequence([
        Animated.timing(flashAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(flashAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]).start();
    }
    prevRegionRef.current = completedRegionCells;
  }, [completedRegionCells, flashAnim]);

  const handleCellPress = useCallback(
    (row: number, col: number) => {
      Haptics.selectionAsync();
      setSelected([row, col]);
    },
    [setSelected]
  );

  return (
    <View style={styles.board}>
      {board.map((row, r) => (
        <View key={r} style={styles.row}>
          {row.map((val, c) => {
            const isSelected = selected?.[0] === r && selected?.[1] === c;
            const isHighlighted =
              !isSelected &&
              selected !== null &&
              (selected[0] === r || selected[1] === c || isSameBox(r, c, selected[0], selected[1]));
            const isGiven = given[r][c];
            const isError = !isHardMode && val !== 0 && !isGiven && val !== solution[r][c];
            const hasNotes = notes[r][c].size > 0 && val === 0;
            const cellNotes = notes[r][c];

            const borderRight = (c + 1) % 3 === 0 && c !== 8;
            const borderBottom = (r + 1) % 3 === 0 && r !== 8;

            const isConflict = conflictCells.some(([cr, cc]) => cr === r && cc === c);
            const isLastCorrect =
              lastCorrectCell !== null && lastCorrectCell[0] === r && lastCorrectCell[1] === c;
            const isRegionComplete = completedRegionCells.some(([cr, cc]) => cr === r && cc === c);

            const selectedVal = selected !== null ? board[selected[0]][selected[1]] : 0;
            const isMatchDigit =
              !isSelected && selected !== null && val !== 0 && val === selectedVal;

            let bgColor: string = C.background;
            if (isSelected) bgColor = C.selected;
            else if (isConflict) bgColor = 'rgba(239,68,68,0.25)';
            else if (isMatchDigit) bgColor = C.highlightMatch;
            else if (isHighlighted) bgColor = C.highlight;

            const scaleTransform = isLastCorrect ? [{ scale: popAnim }] : [];
            const translateXTransform = isConflict ? [{ translateX: shakeAnim }] : [];
            const combinedTransform = [...scaleTransform, ...translateXTransform];

            return (
              <Animated.View
                key={c}
                style={[
                  styles.cellWrapper,
                  combinedTransform.length > 0 ? { transform: combinedTransform } : undefined,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.cell,
                    {
                      backgroundColor: bgColor,
                      borderColor: isSelected ? C.selectedBorder : C.border,
                      borderWidth: isSelected ? 2 : 0.5,
                      borderRightWidth: borderRight ? 2 : isSelected ? 2 : 0.5,
                      borderBottomWidth: borderBottom ? 2 : isSelected ? 2 : 0.5,
                      borderRightColor: borderRight
                        ? C.text
                        : isSelected
                          ? C.selectedBorder
                          : C.border,
                      borderBottomColor: borderBottom
                        ? C.text
                        : isSelected
                          ? C.selectedBorder
                          : C.border,
                    },
                  ]}
                  onPress={() => handleCellPress(r, c)}
                  activeOpacity={0.7}
                >
                  {hasNotes ? (
                    <NoteGrid notes={cellNotes} color={C.note} />
                  ) : val !== 0 ? (
                    <Text
                      style={[
                        styles.cellText,
                        {
                          color: isError ? C.error : isGiven ? C.given : C.placed,
                          fontFamily: isGiven ? Typography.monoBold : Typography.mono,
                        },
                      ]}
                    >
                      {val}
                    </Text>
                  ) : null}
                </TouchableOpacity>
                {isRegionComplete && (
                  <Animated.View
                    style={[
                      StyleSheet.absoluteFill,
                      {
                        backgroundColor: C.success,
                        opacity: flashAnim,
                        pointerEvents: 'none',
                      },
                    ]}
                  />
                )}
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

function NoteGrid({ notes, color }: { notes: Set<number>; color: string }) {
  return (
    <View style={styles.noteGrid}>
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
        <Text key={n} style={[styles.noteText, { color: notes.has(n) ? color : 'transparent' }]}>
          {n}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    width: cellSize * 9 + gap * 8,
  },
  row: {
    flexDirection: 'row',
  },
  cellWrapper: {
    width: cellSize,
    height: cellSize,
  },
  cell: {
    width: cellSize,
    height: cellSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    fontSize: 20,
  },
  noteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    height: '100%',
    padding: 1,
  },
  noteText: {
    width: '33.33%',
    fontSize: 8,
    textAlign: 'center',
    lineHeight: 11,
  },
});
