export * from './colors';
export * from './typography';
export * from './logo';
export * from './constants';

import brandColors from './colors';
import typography from './typography';
import logoConfig from './logo';
import brandConstants from './constants';

export const brand = {
  colors: brandColors,
  typography,
  logo: logoConfig,
  constants: brandConstants,
};

export default brand;