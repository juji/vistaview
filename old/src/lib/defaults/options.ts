import type { VistaOpt } from '../types';

export const DefaultOptions: VistaOpt = {
  // debug, don't remove
  // animationDurationBase: 1000,
  animationDurationBase: 333,
  maxZoomLevel: 2,
  preloads: 1,
  keyboardListeners: true,
  arrowOnSmallScreens: false,
  rapidLimit: 222,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
  },
};
