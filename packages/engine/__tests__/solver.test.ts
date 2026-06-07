import { solve, cloneGrid, countSolutions } from '../solver';

const EMPTY: number[][] = Array.from({ length: 9 }, () => Array(9).fill(0));

describe('solver', () => {
  it('solves an empty grid', () => {
    const grid = cloneGrid(EMPTY);
    const result = solve(grid);
    expect(result).toBe(true);
    expect(grid.flat().every((n) => n >= 1 && n <= 9)).toBe(true);
  });

  it('produces a valid solution (no duplicates in rows, cols, boxes)', () => {
    const grid = cloneGrid(EMPTY);
    solve(grid);
    for (let i = 0; i < 9; i++) {
      expect(new Set(grid[i]).size).toBe(9);
      expect(new Set(grid.map((r) => r[i])).size).toBe(9);
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const box = new Set<number>();
        for (let r = br * 3; r < br * 3 + 3; r++)
          for (let c = bc * 3; c < bc * 3 + 3; c++) box.add(grid[r][c]);
        expect(box.size).toBe(9);
      }
    }
  });

  it('counts solutions as 1 for a fully solved grid', () => {
    const grid = cloneGrid(EMPTY);
    solve(grid);
    expect(countSolutions(grid)).toBe(1);
  });

  it('returns false when a cell has no valid candidates', () => {
    // Fill row 4 with 1-8 (leaving [4,4] empty), and put 9 in col 4 at row 0.
    // [4,4] then needs 9 (only missing row value) but 9 is blocked by col 4.
    // MCV detects 0 candidates at [4,4] immediately, so solve() returns fast.
    const grid = cloneGrid(EMPTY);
    for (let c = 0, v = 1; c < 9; c++) if (c !== 4) grid[4][c] = v++;
    grid[0][4] = 9;
    expect(solve(grid)).toBe(false);
  });
});
