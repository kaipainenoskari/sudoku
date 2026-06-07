import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateStreak, toLocalDateString } from './streak';

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'evil';
export type CellValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type Board = CellValue[][];
export type Notes = Set<number>[][];

interface UndoMove {
  row: number;
  col: number;
  previousValue: CellValue;
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

        // Push current cell value onto undo stack before overwriting
        const previousValue = board[r][c];
        const newHistory = [...history, { row: r, col: c, previousValue }];

        const newBoard = board.map((row) => [...row]) as Board;
        const newNotes = notes.map((row) => row.map((cell) => new Set(cell)));

        newBoard[r][c] = value;
        newNotes[r][c] = new Set();

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
        });
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
        const { history, board } = get();
        if (history.length === 0) return;
        const newHistory = [...history];
        const move = newHistory.pop()!;
        const newBoard = board.map((row) => [...row]) as Board;
        newBoard[move.row][move.col] = move.previousValue;
        set({ board: newBoard, history: newHistory });
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
