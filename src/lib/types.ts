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

export type VistaOpt = {
  animationDurationBase?: number;
  initialZIndex?: number;
  zoomStep?: number;
  maxZoomLevel?: number;
  touchSpeedThreshold?: number;
  preloads?: number;
  keyboardListeners?: boolean;
  arrowOnSmallScreens?: boolean;
  rapidLimit?: number;

  controls?: {
    topLeft?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    topRight?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    topCenter?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomCenter?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomLeft?: (VistaDefaultCtrl | VistaCustomCtrl)[];
    bottomRight?: (VistaDefaultCtrl | VistaCustomCtrl)[];
  };

  // events
  onImageView?: (params: VistaData) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;

  // uesr defined functions
  transitionFunction?: VistaTransitionFn;
  setupFunction?: VistaSetupFn;
  closeFunction?: VistaCloseFn;
  initFunction?: VistaInitFn;
};

export type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';

export type VistaImg = {
  src: string;
  alt?: string;
  thumb?: string;
};

export type VistaImgIdx = {
  index: number;
  imageElm?: HTMLImageElement;
  anchorElm?: HTMLAnchorElement;
} & VistaImg;

export type VistaCustomCtrl = {
  name: string;
  icon: string;
  onClick: (vistaImageIndex: VistaImgIdx, vistaView: VistaView) => void | Promise<void>;
};

export type VistaData = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaImgIdx[] | null; to: VistaImgIdx[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  vistaView: VistaView;
};

export type VistaTransitionFn = (
  params: VistaData,
  abortSignal: AbortSignal
) => Promise<void | (() => void)>;
export type VistaSetupFn = (params: VistaData) => void;
export type VistaCloseFn = (vistaView: VistaView) => void;
export type VistaInitFn = (vistaView: VistaView) => void;

export type VistaParams = {
  elements: string | NodeListOf<HTMLElement> | VistaImg[];
} & VistaOpt;

export type VistaInterface = {
  open: (startIndex?: number) => void;
  close: () => Promise<void>;
  next: () => void;
  prev: () => void;
  destroy: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export type VistaPointer = {
  x: number;
  y: number;
  initX: number;
  initY: number;
  initTime: number;
  deltaTime: number;
  velocityX: number;
  velocityY: number;
  id: number | string;
};

export type VistaPointerEvent = 'down' | 'move' | 'up' | 'cancel';
export type VistaPointerListenerArgs = {
  event: VistaPointerEvent;
  pointer: VistaPointer | undefined;
  domEvent: PointerEvent;
  pointers: VistaPointer[];
  lastPointerLen: number;
};

export type VistaExternalPointerListenerArgs = VistaPointerListenerArgs & {
  hasInternalExecution: boolean;
};

export type VistaPointerListener = (args: VistaPointerListenerArgs) => void;
