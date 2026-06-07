import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
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
  const setSelected = useGameStore((s) => s.setSelected);

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
            const selectedVal = selected !== null ? board[selected[0]][selected[1]] : 0;
            const isMatchDigit =
              !isSelected && selected !== null && val !== 0 && val === selectedVal;

            let bgColor: string = C.background;
            if (isSelected) bgColor = C.selected;
            else if (isConflict) bgColor = 'rgba(239,68,68,0.25)';
            else if (isMatchDigit) bgColor = C.highlightMatch;
            else if (isHighlighted) bgColor = C.highlight;

            return (
              <TouchableOpacity
                key={c}
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
