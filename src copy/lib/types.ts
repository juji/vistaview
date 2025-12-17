import type { VistaView } from './vista-view';

export type VistaElmProps = {
  objectFit: string;
  borderRadius: string;
  objectPosition: string;
  overflow: string;
  top: number;
  left: number;
  width: number;
  height: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

export type VistaImg = {
  src: string;
  alt?: string;
  thumb?: string;
};

export type VistaImageIdx = {
  index: number;
  imageElm?: HTMLImageElement;
  anchorElm?: HTMLAnchorElement;
} & VistaImg;

export type VistaOpt = {
  animationDurationBase?: number;
  initialZIndex?: number;
  detectReducedMotion?: boolean;
  zoomStep?: number;
  maxZoomLevel?: number;
  touchSpeedThreshold?: number;
  preloads?: number;
  keyboardListeners?: boolean;
  arrowOnSmallScreens?: boolean;

  controls?: {
    topLeft?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    topRight?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    topCenter?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomCenter?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomLeft?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomRight?: (VistaDefaultCtrl | VistaCustomCtrl)[];
  };

  // events
  onImageView?: (params: VistaViewData) => void;
  onOpen?: (params: VistaViewData) => void;
  onClose?: (params: VistaViewData) => void;

  // uesr defined functions
  transitionFunction?: VistaTransitionFn;
  setupFunction?: VistaSetupFn;
  closeFunction?: VistaCloseFn;
  initFunction?: VistaViewInitFunction;
};

export type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';

export type VistaCustomCtrl = {
  name: string;
  icon: string;
  onClick: (v: VistaImageIdx) => void | Promise<void>;
};

export type VistaViewData = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaImageIdx[] | null; to: VistaImageIdx[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  vistaView: VistaView;
};

export type VistaTransitionFn = (params: VistaViewData, abortSignal: AbortSignal) => Promise<void>;
export type VistaSetupFn = (params: VistaViewData) => void;
export type VistaCloseFn = (vistaView: VistaView) => void;
export type VistaViewInitFunction = (vistaView: VistaView) => void;
