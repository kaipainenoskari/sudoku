export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert' | 'evil';

// [minClues, maxClues] — fewer clues = harder
export const CLUE_RANGES: Record<Difficulty, [number, number]> = {
  easy:   [46, 50],
  medium: [36, 45],
  hard:   [28, 35],
  expert: [23, 27],
  evil:   [17, 22],
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy:   'Easy',
  medium: 'Medium',
  hard:   'Hard',
  expert: 'Expert',
  evil:   'Evil',
};
