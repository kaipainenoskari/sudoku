import { Grid, cloneGrid, solve, countSolutions } from './solver';
import { Difficulty, CLUE_RANGES } from './difficulty';

export interface Puzzle {
  board: Grid;     // puzzle (0 = empty)
  solution: Grid;  // complete solution
  difficulty: Difficulty;
  clues: number;
}

function generateFullGrid(seed?: number): Grid {
  const grid: Grid = Array.from({ length: 9 }, () => Array(9).fill(0));
  // Seed the RNG if provided (for Daily Puzzle reproducibility)
  if (seed !== undefined) seedRandom(seed);
  solve(grid, true);
  return grid;
}

function digHoles(solution: Grid, targetClues: number): Grid {
  const puzzle = cloneGrid(solution);
  const positions = Array.from({ length: 81 }, (_, i) => i);
  shuffle(positions);

  let clues = 81;
  for (const pos of positions) {
    if (clues <= targetClues) break;
    const row = Math.floor(pos / 9);
    const col = pos % 9;
    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    // Only keep the hole if the puzzle remains uniquely solvable
    const test = cloneGrid(puzzle);
    if (countSolutions(test) === 1) {
      clues--;
    } else {
      puzzle[row][col] = backup;
    }
  }
  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty, seed?: number): Puzzle {
  const solution = generateFullGrid(seed);
  const [minClues, maxClues] = CLUE_RANGES[difficulty];
  const targetClues = minClues + Math.floor(Math.random() * (maxClues - minClues + 1));
  const board = digHoles(cloneGrid(solution), targetClues);
  const actualClues = board.flat().filter((c) => c !== 0).length;

  return { board, solution, difficulty, clues: actualClues };
}

// Seeded RNG — replaces Math.random for deterministic Daily Puzzle generation
let _seed = 0;
function seedRandom(seed: number): void {
  _seed = seed;
  _random = seededRandom;
}
function seededRandom(): number {
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return ((_seed >>> 0) / 0x100000000);
}
let _random: () => number = Math.random;

function shuffle(arr: number[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(_random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

export function generateDailyPuzzle(date: Date): Puzzle {
  // Convert date to a stable integer seed
  const seed =
    date.getFullYear() * 10000 +
    (date.getMonth() + 1) * 100 +
    date.getDate();
  // Daily is always 'hard' difficulty
  return generatePuzzle('hard', seed);
}
