import { calculateStreak } from '../streak';

describe('calculateStreak', () => {
  it('first ever solve sets streak to 1', () => {
    const result = calculateStreak(null, 0, '2026-06-07');
    expect(result.streak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-06-07');
  });

  it('solve on the day after last play increments streak', () => {
    const result = calculateStreak('2026-06-06', 4, '2026-06-07');
    expect(result.streak).toBe(5);
    expect(result.lastPlayedDate).toBe('2026-06-07');
  });

  it('solving twice in one day does not change streak', () => {
    const result = calculateStreak('2026-06-07', 4, '2026-06-07');
    expect(result.streak).toBe(4);
    expect(result.lastPlayedDate).toBe('2026-06-07');
  });

  it('missing one or more days resets streak to 1', () => {
    const result = calculateStreak('2026-06-04', 12, '2026-06-07');
    expect(result.streak).toBe(1);
    expect(result.lastPlayedDate).toBe('2026-06-07');
  });
});
