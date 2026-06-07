export type Grid = number[][];

export function cloneGrid(grid: Grid): Grid {
  return grid.map((row) => [...row]);
}

function isValid(grid: Grid, row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num) return false;
    if (grid[i][col] === num) return false;
  }
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

function findEmpty(grid: Grid): [number, number] | null {
  // Most-constrained-variable: pick the empty cell with fewest candidates
  let best: [number, number] | null = null;
  let bestCount = 10;
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c] !== 0) continue;
      let count = 0;
      for (let n = 1; n <= 9; n++) {
        if (isValid(grid, r, c, n)) count++;
      }
      if (count < bestCount) {
        bestCount = count;
        best = [r, c];
        if (count === 0) return best; // dead end, return immediately
      }
    }
  }
  return best;
}

// Fills all naked singles (cells with exactly one candidate) in-place.
// Returns the list of cells filled so the caller can undo them,
// or null if a contradiction is found (a cell has zero candidates).
function propagate(grid: Grid): Array<[number, number]> | null {
  const filled: Array<[number, number]> = [];
  let changed = true;
  while (changed) {
    changed = false;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] !== 0) continue;
        let candidates = 0;
        let lastNum = 0;
        for (let n = 1; n <= 9; n++) {
          if (isValid(grid, r, c, n)) {
            candidates++;
            lastNum = n;
          }
        }
        if (candidates === 0) return null;
        if (candidates === 1) {
          grid[r][c] = lastNum;
          filled.push([r, c]);
          changed = true;
        }
      }
    }
  }
  return filled;
}

export function solve(grid: Grid, randomise = false, rng: () => number = Math.random): boolean {
  const cell = findEmpty(grid);
  if (!cell) return true; // solved

  const [row, col] = cell;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (randomise) shuffle(nums, rng);

  for (const num of nums) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solve(grid, randomise, rng)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

// Returns number of solutions (stops at limit — we only need to know if unique).
// Uses naked-singles propagation before each branch to shrink the search space.
export function countSolutions(grid: Grid, limit = 2): number {
  const filled = propagate(grid);
  if (filled === null) {
    return 0; // contradiction
  }

  const cell = findEmpty(grid);
  let count = 0;

  if (!cell) {
    count = 1; // solved
  } else {
    const [row, col] = cell;
    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        count += countSolutions(grid, limit);
        grid[row][col] = 0;
        if (count >= limit) break;
      }
    }
  }

  // Undo propagation so the caller's grid is unchanged
  for (const [r, c] of filled) grid[r][c] = 0;
  return count;
}

function shuffle<T>(arr: T[], rng: () => number): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
