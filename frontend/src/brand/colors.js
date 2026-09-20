export const brandColors = {
  primary: {
    DEFAULT: '#48A14D',
    dark: '#1E5E29',
    light: '#E8F5E9',
  },
  navy: '#1B263B',
  orange: {
    50: '#E8F5E9',
    200: '#B7DDBA',
    300: '#8BC58F',
    400: '#68B06D',
    500: '#48A14D',
    600: '#1E5E29',
    700: '#1E5E29',
  },
  neutral: {
    white: '#FFFFFF',
    black: '#0B0B0F',
    gray: {
      50: '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#868E96',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
  },
  semantic: {
    success: '#1E5E29',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
};

export const tailwindColorMap = {
  brand: brandColors.primary,
  navy: brandColors.navy,
  orange: brandColors.orange,
};

export default brandColors;