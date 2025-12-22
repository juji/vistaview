import type { VistaImage } from './vista-image';
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
  maxZoomLevel?: number;
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

export type VistaCustomCtrl = {
  name: string;
  icon: string;
  description?: string;
  onClick: (vistaImage: VistaImage, vistaView: VistaView) => void | Promise<void>;
};

export type VistaData = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaImage[] | null; to: VistaImage[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  vistaView: VistaView;
};

export type VistaTransitionFn = (
  params: VistaData,
  abortSignal: AbortSignal
) => { cleanup: () => void; transitionEnded: Promise<void> } | void;

export type VistaSetupFn = (params: VistaData) => void;
export type VistaCloseFn = (vistaView: VistaView) => void;
export type VistaInitFn = (vistaView: VistaView) => void;

export type VistaInterface = {
  open: (startIndex?: number) => void;
  close: () => Promise<void>;
  next: () => void;
  prev: () => void;
  destroy: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export type VistaPointerArgs = {
  elm?: HTMLElement | Document;
  listeners?: VistaPointerListener[];
};

export type VistaPointer = {
  x: number;
  y: number;
  movementX: number;
  movementY: number;
  id: number | string;
};

export type VistaPointerEvent = 'down' | 'move' | 'up' | 'cancel';
export type VistaPointerListenerArgs = {
  event: VistaPointerEvent;
  pointer: VistaPointer;
  pointers: VistaPointer[];
  lastPointerLen: number;
};

export type VistaPointerListener = (args: VistaPointerListenerArgs) => void;

export type VistaExternalPointerListenerArgs = VistaPointerListenerArgs & {
  hasInternalExecution: boolean;
  abortController: AbortController | null;
};

// new

export type VistaImgConfig = {
  src: string;
  alt?: string;
  srcSet?: string;
};

export type VistaImgOrigin = {
  anchor?: HTMLAnchorElement;
  image: HTMLImageElement;
  src: string;
  srcSet: string;
  borderRadius: string;
  objectFit: string;
};

export type VistaParamsNeo = {
  elements: string | VistaImgConfig[];
} & VistaOpt;
