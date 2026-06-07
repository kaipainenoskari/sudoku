import { generatePuzzle, generateDailyPuzzle } from '../generator';
import { countSolutions } from '../solver';
import { CLUE_RANGES, Difficulty } from '../difficulty';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert', 'evil'];

describe('generatePuzzle', () => {
  DIFFICULTIES.forEach((diff) => {
    it(`generates a uniquely solvable ${diff} puzzle`, () => {
      const { board, solution, clues } = generatePuzzle(diff);

      // Clue count in expected range
      const [min, max] = CLUE_RANGES[diff];
      expect(clues).toBeGreaterThanOrEqual(min);
      expect(clues).toBeLessThanOrEqual(max);

      // Solution is complete
      expect(solution.flat().every((n) => n >= 1 && n <= 9)).toBe(true);

      // Puzzle has exactly one solution
      const copy = board.map((r) => [...r]);
      expect(countSolutions(copy)).toBe(1);
    });
  });
});

describe('generateDailyPuzzle', () => {
  it('returns the same puzzle for the same date', () => {
    const date = new Date('2026-06-07');
    const a = generateDailyPuzzle(date);
    const b = generateDailyPuzzle(date);
    expect(a.board).toEqual(b.board);
    expect(a.solution).toEqual(b.solution);
  });

  it('returns different puzzles for different dates', () => {
    const a = generateDailyPuzzle(new Date('2026-06-07'));
    const b = generateDailyPuzzle(new Date('2026-06-08'));
    expect(a.board).not.toEqual(b.board);
  });

  it('generates a hard difficulty puzzle', () => {
    const { difficulty } = generateDailyPuzzle(new Date());
    expect(difficulty).toBe('hard');
  });
});
