export const Colors = {
  dark: {
    background: '#0D0D0F',
    surface: '#18181B',
    surfaceAlt: '#1F1F23',
    border: '#2A2A2F',
    text: '#F4F4F5',
    textMuted: '#71717A',
    accent: '#6366F1', // indigo — brand colour
    accentDim: '#312E81',
    given: '#F4F4F5', // pre-filled digits
    placed: '#A5B4FC', // player-placed digits
    note: '#71717A',
    error: '#EF4444',
    selected: '#1E1E3A',
    selectedBorder: '#6366F1',
    highlight: '#1A1A2E', // same row/col/box as selected
    highlightMatch: '#1A2A3A', // same digit as selected
    success: '#22C55E',
  },
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceAlt: '#F4F4F5',
    border: '#E4E4E7',
    text: '#09090B',
    textMuted: '#71717A',
    accent: '#4F46E5',
    accentDim: '#EEF2FF',
    given: '#09090B',
    placed: '#4F46E5',
    note: '#A1A1AA',
    error: '#DC2626',
    selected: '#EEF2FF',
    selectedBorder: '#4F46E5',
    highlight: '#F5F5FF',
    highlightMatch: '#E8F0FF', // same digit as selected
    success: '#16A34A',
  },
} as const;

export const Typography = {
  // JetBrains Mono variants loaded via expo-font
  mono: 'JetBrainsMono_400Regular',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BoardSize = {
  cellSize: 38,
  gap: 1,
} as const;
