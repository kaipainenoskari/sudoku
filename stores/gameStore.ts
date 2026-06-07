import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreak, toLocalDateString } from './streak';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'evil';
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Board = CellValue[][];
export type Notes = Set<number>[][];

function deriveCompletedRegionCells(
  board: Board,
  solution: Board,
  r: number,
  c: number
): Array<[number, number]> {
  const cells: Array<[number, number]> = [];

  // Check row
  const rowComplete = board[r].every((v, ci) => v !== 0 && v === solution[r][ci]);
  if (rowComplete) {
    for (let ci = 0; ci < 9; ci++) cells.push([r, ci]);
  }

  // Check col
  const colComplete = board.every((row, ri) => row[c] !== 0 && row[c] === solution[ri][c]);
  if (colComplete) {
    for (let ri = 0; ri < 9; ri++) {
      if (!cells.some(([cr, cc]) => cr === ri && cc === c)) cells.push([ri, c]);
    }
  }

  // Check box
  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;
  let boxComplete = true;
  for (let ri = br; ri < br + 3 && boxComplete; ri++) {
    for (let ci = bc; ci < bc + 3 && boxComplete; ci++) {
      if (board[ri][ci] === 0 || board[ri][ci] !== solution[ri][ci]) boxComplete = false;
    }
  }
  if (boxComplete) {
    for (let ri = br; ri < br + 3; ri++) {
      for (let ci = bc; ci < bc + 3; ci++) {
        if (!cells.some(([cr, cc]) => cr === ri && cc === ci)) cells.push([ri, ci]);
      }
    }
  }

  return cells;
}

function deriveCompletedDigits(board: Board, solution: Board): Set<number> {
  const counts = new Map<number, number>();
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const v = board[r][c];
      if (v > 0 && v === solution[r][c]) {
        counts.set(v, (counts.get(v) ?? 0) + 1);
      }
    }
  }
  const completed = new Set<number>();
  counts.forEach((count, digit) => {
    if (count === 9) completed.add(digit);
  });
  return completed;
}

interface UndoMove {
  row: number;
  col: number;
  previousValue: CellValue;
  previousNotes: Notes;
}

interface GameState {
  // Current game
  board: Board; // current state (0 = empty)
  solution: Board;
  given: boolean[][]; // cells that were pre-filled
  notes: Notes;
  selected: [number, number] | null;
  isHardMode: boolean;
  isNotesMode: boolean;
  difficulty: Difficulty;
  startTime: number | null;
  elapsedSeconds: number;
  mistakes: number;
  isComplete: boolean;
  history: UndoMove[]; // session-only undo stack
  conflictCells: Array<[number, number]>;
  completedDigits: Set<number>;
  lastCorrectCell: [number, number] | null;
  completedRegionCells: Array<[number, number]>;

  // Stats
  streak: number;
  lastPlayedDate: string | null;
  totalSolves: number;
  bestTimes: Record<Difficulty, number | null>;

  // Actions
  setSelected: (cell: [number, number] | null) => void;
  placeNumber: (value: CellValue) => void;
  toggleNote: (value: number) => void;
  toggleNotesMode: () => void;
  undo: () => void;
  newGame: (board: Board, solution: Board, difficulty: Difficulty) => void;
  tick: () => void;
  setHardMode: (on: boolean) => void;
}

const emptyBoard = (): Board => Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
const emptyNotes = (): Notes =>
  Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
const emptyGiven = (): boolean[][] => Array.from({ length: 9 }, () => Array(9).fill(false));

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      board: emptyBoard(),
      solution: emptyBoard(),
      given: emptyGiven(),
      notes: emptyNotes(),
      selected: null,
      isHardMode: false,
      isNotesMode: false,
      difficulty: 'medium',
      startTime: null,
      elapsedSeconds: 0,
      mistakes: 0,
      isComplete: false,
      history: [],
      conflictCells: [],
      completedDigits: new Set<number>(),

      lastCorrectCell: null,
      completedRegionCells: [],

      streak: 0,
      lastPlayedDate: null,
      totalSolves: 0,
      bestTimes: { easy: null, medium: null, hard: null, expert: null, evil: null },

      setSelected: (cell) => set({ selected: cell }),

      toggleNotesMode: () => set((s) => ({ isNotesMode: !s.isNotesMode })),

      placeNumber: (value) => {
        const {
          selected,
          board,
          given,
          solution,
          notes,
          isHardMode,
          difficulty,
          elapsedSeconds,
          bestTimes,
          history,
        } = get();
        if (!selected) return;
        const [r, c] = selected;
        if (given[r][c]) return;

        // Push current cell value and notes snapshot onto undo stack before overwriting
        const previousValue = board[r][c];
        const previousNotes = notes.map((row) => row.map((cell) => new Set(cell)));
        const newHistory = [...history, { row: r, col: c, previousValue, previousNotes }];

        const newBoard = board.map((row) => [...row]) as Board;
        const newNotes = notes.map((row) => row.map((cell) => new Set(cell)));

        newBoard[r][c] = value;
        newNotes[r][c] = new Set();

        // Remove the placed digit from notes in the same row, column, and 3x3 box
        if (value !== 0) {
          const boxRow = Math.floor(r / 3) * 3;
          const boxCol = Math.floor(c / 3) * 3;
          for (let i = 0; i < 9; i++) {
            newNotes[r][i].delete(value); // same row
            newNotes[i][c].delete(value); // same column
          }
          for (let br = boxRow; br < boxRow + 3; br++) {
            for (let bc = boxCol; bc < boxCol + 3; bc++) {
              newNotes[br][bc].delete(value); // same box
            }
          }
        }

        const isCorrect = value === 0 || value === solution[r][c];
        const newMistakes =
          !isHardMode && !isCorrect && value > 0 ? get().mistakes + 1 : get().mistakes;

        const isComplete =
          value > 0 &&
          newBoard.every((row, ri) => row.every((cell, ci) => cell === solution[ri][ci]));

        let newBestTimes = bestTimes;
        if (isComplete) {
          const prev = bestTimes[difficulty];
          if (prev === null || elapsedSeconds < prev) {
            newBestTimes = { ...bestTimes, [difficulty]: elapsedSeconds };
          }
        }

        const { streak, lastPlayedDate: newLastPlayedDate } = isComplete
          ? calculateStreak(get().lastPlayedDate, get().streak, toLocalDateString(new Date()))
          : { streak: get().streak, lastPlayedDate: get().lastPlayedDate };

        // Detect conflict cells (non-hard mode only)
        const newConflictCells: Array<[number, number]> = [];
        if (!isHardMode && value > 0 && !isCorrect) {
          for (let i = 0; i < 9; i++) {
            if (i !== c && newBoard[r][i] === value) newConflictCells.push([r, i]);
            if (i !== r && newBoard[i][c] === value) newConflictCells.push([i, c]);
          }
          const br = Math.floor(r / 3) * 3;
          const bc = Math.floor(c / 3) * 3;
          for (let ri = br; ri < br + 3; ri++) {
            for (let ci = bc; ci < bc + 3; ci++) {
              if ((ri !== r || ci !== c) && newBoard[ri][ci] === value) {
                newConflictCells.push([ri, ci]);
              }
            }
          }
          newConflictCells.push([r, c]);
        }

        const isCorrectPlacement = value > 0 && isCorrect;
        const newCompletedRegionCells = isCorrectPlacement
          ? deriveCompletedRegionCells(newBoard, solution, r, c)
          : [];

        set({
          board: newBoard,
          notes: newNotes,
          mistakes: newMistakes,
          isComplete,
          bestTimes: newBestTimes,
          totalSolves: isComplete ? get().totalSolves + 1 : get().totalSolves,
          streak,
          lastPlayedDate: newLastPlayedDate ?? get().lastPlayedDate,
          history: newHistory,
          conflictCells: newConflictCells,
          completedDigits: deriveCompletedDigits(newBoard, solution),
          lastCorrectCell: isCorrectPlacement ? [r, c] : null,
          completedRegionCells: newCompletedRegionCells,
        });

        if (newConflictCells.length > 0) {
          setTimeout(() => set({ conflictCells: [] }), 800);
        }

        if (isCorrectPlacement) {
          setTimeout(() => set({ lastCorrectCell: null }), 200);
        }

        if (newCompletedRegionCells.length > 0) {
          setTimeout(() => set({ completedRegionCells: [] }), 600);
        }
      },

      toggleNote: (value) => {
        const { selected, notes, given } = get();
        if (!selected) return;
        const [r, c] = selected;
        if (given[r][c]) return;

        const newNotes = notes.map((row) => row.map((cell) => new Set(cell)));
        if (newNotes[r][c].has(value)) {
          newNotes[r][c].delete(value);
        } else {
          newNotes[r][c].add(value);
        }
        set({ notes: newNotes });
      },

      undo: () => {
        const { history, board, solution } = get();
        if (history.length === 0) return;
        const newHistory = [...history];
        const move = newHistory.pop()!;
        const newBoard = board.map((row) => [...row]) as Board;
        newBoard[move.row][move.col] = move.previousValue;
        set({
          board: newBoard,
          notes: move.previousNotes,
          history: newHistory,
          completedDigits: deriveCompletedDigits(newBoard, solution),
        });
      },

      newGame: (board, solution, difficulty) => {
        const given = board.map((row) => row.map((cell) => cell !== 0));
        set({
          board: board.map((row) => [...row]) as Board,
          solution,
          given,
          notes: emptyNotes(),
          selected: null,
          isNotesMode: false,
          difficulty,
          startTime: Date.now(),
          elapsedSeconds: 0,
          mistakes: 0,
          isComplete: false,
          history: [],
          completedDigits: new Set<number>(),
        });
      },

      tick: () => set((s) => ({ elapsedSeconds: s.elapsedSeconds + 1 })),

      setHardMode: (on) => set({ isHardMode: on }),
    }),
    {
      name: 'sudoku-game-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        streak: s.streak,
        lastPlayedDate: s.lastPlayedDate,
        totalSolves: s.totalSolves,
        bestTimes: s.bestTimes,
        isHardMode: s.isHardMode,
      }),
    }
  )
);
