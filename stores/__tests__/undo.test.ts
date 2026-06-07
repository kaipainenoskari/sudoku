import { useGameStore } from '../gameStore';
import type { Board, CellValue } from '../gameStore';

// Helper to build a minimal board and solution for tests
function makeBoard(overrides: Array<[number, number, CellValue]> = []): Board {
  const board = Array.from({ length: 9 }, () => Array(9).fill(0) as CellValue[]);
  for (const [r, c, v] of overrides) {
    board[r][c] = v;
  }
  return board as Board;
}

// A valid 9×9 solution (row-by-row). Used as the solution so placeNumber
// doesn't count anything as a mistake.
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

// Start every test from a known clean state
function startFreshGame(givenOverrides: Array<[number, number, CellValue]> = []) {
  const board = makeBoard(givenOverrides);
  useGameStore.getState().newGame(board, SOLUTION, 'medium');
}

describe('undo history', () => {
  beforeEach(() => {
    // Reset to a blank board where every cell is empty (not given) so we can place freely
    startFreshGame();
  });

  it('placing a number can be undone, restoring the previous cell value', () => {
    const store = useGameStore.getState();
    store.setSelected([0, 0]);
    store.placeNumber(3);
    expect(useGameStore.getState().board[0][0]).toBe(3);

    useGameStore.getState().undo();
    expect(useGameStore.getState().board[0][0]).toBe(0);
  });

  it('erasing (placing 0) can be undone', () => {
    // Place a number first, then erase it, then undo the erase
    const store = useGameStore.getState();
    store.setSelected([1, 1]);
    store.placeNumber(7);
    expect(useGameStore.getState().board[1][1]).toBe(7);

    useGameStore.getState().setSelected([1, 1]);
    useGameStore.getState().placeNumber(0 as CellValue); // erase
    expect(useGameStore.getState().board[1][1]).toBe(0);

    useGameStore.getState().undo();
    expect(useGameStore.getState().board[1][1]).toBe(7);
  });

  it('undo does nothing when history is empty', () => {
    // Fresh game, no moves — undo should be a no-op
    const boardBefore = useGameStore.getState().board.map((r) => [...r]);
    useGameStore.getState().undo();
    const boardAfter = useGameStore.getState().board;
    expect(boardAfter).toEqual(boardBefore);
  });

  it('undo restores notes that were cleared when a digit was placed', () => {
    const store = useGameStore.getState();
    // Toggle note 3 in cell [0,0]
    store.setSelected([0, 0]);
    store.toggleNote(3);
    expect(useGameStore.getState().notes[0][0].has(3)).toBe(true);

    // Place a digit — this clears the notes for that cell
    useGameStore.getState().placeNumber(5 as CellValue);
    expect(useGameStore.getState().notes[0][0].size).toBe(0);

    // Undo — the note should be restored
    useGameStore.getState().undo();
    expect(useGameStore.getState().notes[0][0].has(3)).toBe(true);
    expect(useGameStore.getState().board[0][0]).toBe(0);
  });

  it('newGame clears the undo history', () => {
    // Make a move, then start a new game, then undo should be a no-op
    const store = useGameStore.getState();
    store.setSelected([2, 2]);
    store.placeNumber(5);

    // Start a fresh game
    startFreshGame();

    // Record the board right after new game
    const boardAfterNewGame = useGameStore.getState().board.map((r) => [...r]);

    // Undo should not restore the pre-newGame move
    useGameStore.getState().undo();
    expect(useGameStore.getState().board).toEqual(boardAfterNewGame);
  });
});
