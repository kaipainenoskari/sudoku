import { useGameStore } from '../gameStore';
import type { Board, Notes, CellValue } from '../gameStore';

// A valid 9×9 solution (same as undo.test.ts)
const SOLUTION: Board = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
] as Board;

function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]) as Board;
}

function emptyNotes(): Notes {
  return Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set<number>()));
}

function emptyGiven(): boolean[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(false));
}

/** Set up a fresh empty game state directly via setState */
function setupGame(notesOverrides: Array<[number, number, number[]]> = []) {
  const notes = emptyNotes();
  for (const [r, c, vals] of notesOverrides) {
    for (const v of vals) {
      notes[r][c].add(v);
    }
  }

  useGameStore.setState({
    board: emptyBoard(),
    solution: SOLUTION,
    given: emptyGiven(),
    notes,
    selected: null,
    isHardMode: false,
    isNotesMode: false,
    difficulty: 'medium',
    startTime: Date.now(),
    elapsedSeconds: 0,
    mistakes: 0,
    isComplete: false,
    history: [],
  });
}

describe('note auto-removal on digit placement', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  it('placing digit N removes N from notes in the same row', () => {
    // Place notes containing digit 5 in multiple cells on row 0
    setupGame([
      [0, 2, [5, 3]], // same row, different col
      [0, 7, [5, 1]], // same row, different col
    ]);

    useGameStore.getState().setSelected([0, 0]);
    useGameStore.getState().placeNumber(5 as CellValue);

    const notes = useGameStore.getState().notes;
    // digit 5 should be gone from all row-0 cells
    expect(notes[0][2].has(5)).toBe(false);
    expect(notes[0][7].has(5)).toBe(false);
    // other digits should remain
    expect(notes[0][2].has(3)).toBe(true);
    expect(notes[0][7].has(1)).toBe(true);
  });

  it('placing digit N removes N from notes in the same column', () => {
    setupGame([
      [2, 0, [5, 9]], // same col as placement
      [7, 0, [5, 4]], // same col as placement
    ]);

    useGameStore.getState().setSelected([0, 0]);
    useGameStore.getState().placeNumber(5 as CellValue);

    const notes = useGameStore.getState().notes;
    expect(notes[2][0].has(5)).toBe(false);
    expect(notes[7][0].has(5)).toBe(false);
    // other digits survive
    expect(notes[2][0].has(9)).toBe(true);
    expect(notes[7][0].has(4)).toBe(true);
  });

  it('placing digit N removes N from notes in the same 3x3 box', () => {
    // Place at (0,0) -> box (0,0) covers rows 0-2, cols 0-2
    setupGame([
      [1, 1, [5, 2]], // same box
      [2, 2, [5, 7]], // same box
    ]);

    useGameStore.getState().setSelected([0, 0]);
    useGameStore.getState().placeNumber(5 as CellValue);

    const notes = useGameStore.getState().notes;
    expect(notes[1][1].has(5)).toBe(false);
    expect(notes[2][2].has(5)).toBe(false);
    // other digits survive
    expect(notes[1][1].has(2)).toBe(true);
    expect(notes[2][2].has(7)).toBe(true);
  });

  it('erasing (placing 0) does not affect notes', () => {
    setupGame([
      [0, 3, [1, 2]], // same row
      [3, 0, [1, 3]], // same col
      [1, 1, [1, 4]], // same box
    ]);

    useGameStore.getState().setSelected([0, 0]);
    useGameStore.getState().placeNumber(0 as CellValue);

    const notes = useGameStore.getState().notes;
    // nothing should be removed
    expect(notes[0][3].has(1)).toBe(true);
    expect(notes[0][3].has(2)).toBe(true);
    expect(notes[3][0].has(1)).toBe(true);
    expect(notes[3][0].has(3)).toBe(true);
    expect(notes[1][1].has(1)).toBe(true);
    expect(notes[1][1].has(4)).toBe(true);
  });
});
