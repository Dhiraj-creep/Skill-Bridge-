export type ThemePreset = 'campus-spectrum' | 'ocean' | 'sunset' | 'forest';

export interface ThemeOption {
  id: ThemePreset;
  name: string;
  description: string;
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
  };
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'campus-spectrum',
    name: 'Campus Spectrum',
    description: 'Default multicolour theme with collegiate navy, blue, purple, and teal accents',
    palette: {
      primary: '#2563EB',
      secondary: '#7C3AED',
      accent: '#0F766E',
      bg: '#F8FAFC',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Calm marine palette featuring sky blue, cyan, and deep teal',
    palette: {
      primary: '#0284C7',
      secondary: '#0D9488',
      accent: '#0891B2',
      bg: '#F0F9FF',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm energetic palette with burnt orange, vivid berry pink, and purple',
    palette: {
      primary: '#EA580C',
      secondary: '#BE185D',
      accent: '#9333EA',
      bg: '#FFF7ED',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Grounding palette with evergreen, deep teal, and warm amber gold',
    palette: {
      primary: '#15803D',
      secondary: '#0F766E',
      accent: '#B45309',
      bg: '#F0FDF4',
    },
  },
];
