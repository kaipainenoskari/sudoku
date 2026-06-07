export interface StreakResult {
  streak: number;
  lastPlayedDate: string;
}

export function calculateStreak(
  lastPlayedDate: string | null,
  currentStreak: number,
  today: string
): StreakResult {
  if (lastPlayedDate === null) {
    return { streak: 1, lastPlayedDate: today };
  }

  const last = new Date(lastPlayedDate);
  const now = new Date(today);
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 0) return { streak: currentStreak, lastPlayedDate: today };
  if (diffDays === 1) return { streak: currentStreak + 1, lastPlayedDate: today };
  return { streak: 1, lastPlayedDate: today };
}

export function toLocalDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
