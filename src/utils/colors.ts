export const COLORS = {
  /** Singapore Red — bold, energetic accent */
  red: '#ED2939',
  /** Singapore Blue — primary, trustworthy */
  blue: '#1B4987',
  /** Gold — premium, valuation highlights */
  gold: '#D4A843',
  /** Green — positive trends, buy recommendation */
  green: '#2E7D32',

  /** Neutral palette */
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  /** Semantic */
  success: '#2E7D32',
  warning: '#F9A825',
  error: '#C62828',
  info: '#1B4987',
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FONT_SIZES = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  title: 34,
} as const;

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
