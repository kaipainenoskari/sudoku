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

export function solve(grid: Grid, randomise = false): boolean {
  const cell = findEmpty(grid);
  if (!cell) return true; // solved

  const [row, col] = cell;
  const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  if (randomise) shuffle(nums);

  for (const num of nums) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      if (solve(grid, randomise)) return true;
      grid[row][col] = 0;
    }
  }
  return false;
}

// Returns number of solutions (stops at 2 — we only need to know if unique)
export function countSolutions(grid: Grid, limit = 2): number {
  const cell = findEmpty(grid);
  if (!cell) return 1;

  const [row, col] = cell;
  let count = 0;
  for (let num = 1; num <= 9; num++) {
    if (isValid(grid, row, col, num)) {
      grid[row][col] = num;
      count += countSolutions(grid, limit);
      grid[row][col] = 0;
      if (count >= limit) return count;
    }
  }
  return count;
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
