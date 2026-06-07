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
      const row = new Set(grid[i]);
      expect(row.size).toBe(9);

      const col = new Set(grid.map((r) => r[i]));
      expect(col.size).toBe(9);
    }

    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const box = new Set<number>();
        for (let r = br * 3; r < br * 3 + 3; r++) {
          for (let c = bc * 3; c < bc * 3 + 3; c++) {
            box.add(grid[r][c]);
          }
        }
        expect(box.size).toBe(9);
      }
    }
  });

  it('counts solutions correctly for a fully solved grid (should be 1)', () => {
    const grid = cloneGrid(EMPTY);
    solve(grid);
    expect(countSolutions(grid)).toBe(1);
  });

  it('counts solutions for empty grid as >= 2', () => {
    const grid = cloneGrid(EMPTY);
    expect(countSolutions(grid, 2)).toBe(2);
  });

  it('returns false for an unsolvable grid', () => {
    const grid = cloneGrid(EMPTY);
    // Place two 1s in the same row — invalid
    grid[0][0] = 1;
    grid[0][1] = 1;
    expect(solve(grid)).toBe(false);
  });
});
