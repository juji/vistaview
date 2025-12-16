import type { VistaOpt } from '../types';
import { vistaViewDownload } from '../components';

export const DefaultOptions: VistaOpt = {
  // debug, don't remove
  // animationDurationBase: 1000,
  animationDurationBase: 333,
  zoomStep: 500,
  maxZoomLevel: 2,
  touchSpeedThreshold: 0.5,
  preloads: 1,
  keyboardListeners: true,
  arrowOnSmallScreens: false,
  rapidLimit: 700,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', vistaViewDownload(), 'close'],
    bottomLeft: ['description'],
  },
};
