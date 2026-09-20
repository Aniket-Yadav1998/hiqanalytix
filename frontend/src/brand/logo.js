export const logoConfig = {
  primary: {
    src: '/logo-transparent.png',
    alt: 'HIQAnalytix Logo',
    width: 160,
    height: 48,
  },
  secondary: {
    src: '/logo.jpeg',
    alt: 'HIQAnalytix Logo',
    width: 160,
    height: 48,
  },
  favicon: {
    src: '/logo-transparent.png',
    sizes: '32x32',
  },
  variants: {
    full: {
      src: '/logo-transparent.png',
      alt: 'HIQAnalytix',
      width: 200,
      height: 60,
    },
    icon: {
      src: '/logo-transparent.png',
      alt: 'HIQAnalytix',
      width: 48,
      height: 48,
    },
    footer: {
      src: '/logo-transparent.png',
      alt: 'HIQAnalytix',
      width: 140,
      height: 42,
    },
  },
  usage: {
    lightBackground: 'primary',
    darkBackground: 'primary',
    smallSpaces: 'icon',
    footer: 'footer',
  },
};

export const logoPaths = {
  transparent: '/logo-transparent.png',
  jpeg: '/logo.jpeg',
};

export default logoConfig;