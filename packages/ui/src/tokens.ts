/**
 * HIKE UP brand tokens, sampled from the supplied logo artwork.
 * The web app's Tailwind theme (apps/web/app/globals.css) mirrors these values.
 */
export const brandColors = {
  navy: {
    950: '#061633',
    900: '#0A1F45',
    800: '#0D2A5C',
    700: '#14377A',
    600: '#1C4796',
    500: '#2A5BB5',
  },
  gold: {
    600: '#D98E00',
    500: '#F5A800',
    400: '#FFBE2E',
    300: '#FFD36B',
    100: '#FFF3D6',
  },
  slate: {
    50: '#F6F8FB',
    100: '#EDF1F7',
    200: '#DCE3EE',
    400: '#8C99AE',
    600: '#4B5870',
    800: '#1F2A3D',
  },
  white: '#FFFFFF',
} as const;

/** Default accent colours offered in the admin package editor. */
export const packageColorPresets = [
  { name: 'Bronze', value: '#B5651D' },
  { name: 'Silver', value: '#8E9AAF' },
  { name: 'Gold', value: '#F5A800' },
  { name: 'Navy', value: '#0D2A5C' },
  { name: 'Platinum', value: '#5B6B82' },
] as const;
