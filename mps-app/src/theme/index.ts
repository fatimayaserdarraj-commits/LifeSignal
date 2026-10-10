import { Platform } from 'react-native';

/** MPS design tokens — a deep "night greenhouse" palette with luminous accents. */
export const colors = {
  bg: '#06140E',
  bgAlt: '#0B2E1F',
  surface: 'rgba(255,255,255,0.06)',
  surfaceStrong: 'rgba(255,255,255,0.10)',
  border: 'rgba(255,255,255,0.12)',
  text: '#F2FBF5',
  textDim: 'rgba(242,251,245,0.68)',
  textFaint: 'rgba(242,251,245,0.42)',
  primary: '#3DDC84',
  primaryDeep: '#14A55B',
  lime: '#C6F432',
  mint: '#7CF5C9',
  sun: '#FFC857',
  coral: '#FF7A6B',
  sky: '#5BC0FF',
  violet: '#A98BFF',
  danger: '#FF5A5F',
} as const;

export const gradients = {
  screen: ['#0B2E1F', '#06140E', '#030A07'] as const,
  primary: ['#3DDC84', '#14A55B'] as const,
  lime: ['#C6F432', '#3DDC84'] as const,
  sun: ['#FFC857', '#FF8A3D'] as const,
  coral: ['#FF9A8B', '#FF5A5F'] as const,
  sky: ['#5BC0FF', '#3A7BFF'] as const,
  violet: ['#C3A6FF', '#7B5CFF'] as const,
  mint: ['#7CF5C9', '#22B8A0'] as const,
  glass: ['rgba(255,255,255,0.12)', 'rgba(255,255,255,0.03)'] as const,
};

export type GradientName = keyof typeof gradients;

export const radius = { sm: 10, md: 16, lg: 22, xl: 30, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const font = {
  display: Platform.select({ ios: 'System', default: undefined }),
  sizes: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, hero: 34 },
} as const;

export const shadow = Platform.select({
  ios: { shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
  android: { elevation: 8 },
  default: {},
});
