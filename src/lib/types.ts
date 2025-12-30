import type { VistaBox } from './vista-box';
import type { VistaState } from './vista-state';
import type { VistaView } from './vista-view';
import type { VistaHiresTransitionOpt } from './vista-hires-transition';

export type { VistaImage } from './vista-image';
export type VistaOpt = {
  animationDurationBase?: number;
  initialZIndex?: number;
  maxZoomLevel?: number;
  preloads?: number;
  keyboardListeners?: boolean;
  arrowOnSmallScreens?: boolean;
  rapidLimit?: number;

  controls?: {
    topLeft?: (VistaDefaultCtrl | VistaExtension)[];
    topRight?: (VistaDefaultCtrl | VistaExtension)[];
    topCenter?: (VistaDefaultCtrl | VistaExtension)[];
    bottomCenter?: (VistaDefaultCtrl | VistaExtension)[];
    bottomLeft?: (VistaDefaultCtrl | VistaExtension)[];
    bottomRight?: (VistaDefaultCtrl | VistaExtension)[];
  };

  extensions?: VistaExtension[];

  // events
  onImageView?: (params: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;

  // uesr defined functions
  transitionFunction?: VistaTransitionFn;
  imageSetupFunction?: VistaImageSetupFn;
  openFunction?: VistaOpenFn;
  closeFunction?: VistaCloseFn;
  initFunction?: VistaInitFn;
};

export type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';

export type VistaExtension = {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (params: VistaImageParams) => VistaBox | void | null | undefined;
  onImageView?: (params: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
  onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
  onReactivateUi?: (names: string[], vistaView: VistaView) => void;
};

export type VistaData = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaBox[] | null; to: VistaBox[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  vistaView: VistaView;
};

export type VistaTransitionFn = (
  params: VistaData,
  abortSignal: AbortSignal
) => { cleanup: () => void; transitionEnded: Promise<void> } | void;

export type VistaImageSetupFn = (params: VistaData) => void;
export type VistaInitFn = (vistaView: VistaView) => void;
export type VistaOpenFn = (vistaView: VistaView) => void;
export type VistaCloseFn = (vistaView: VistaView) => void;

export type VistaInterface = {
  open: (startIndex?: number) => void;
  close: () => Promise<void>;
  reset: () => void;
  next: () => void;
  prev: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
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

export type VistaPointerListenerArgs = {
  event: 'down' | 'move' | 'up' | 'cancel';
  pointer: VistaPointer;
  pointers: VistaPointer[];
  lastPointerLen: number;
};

export type VistaPointerListener = (args: VistaPointerListenerArgs) => void;

export type VistaExternalPointerListenerArgs = VistaPointerListenerArgs & {
  state: VistaState;
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

export type VistaParsedElm = {
  config: VistaImgConfig;
  parsedSrcSet?: { src: string; width: number }[];
  origin?: VistaImgOrigin;
};

export type VistaImageParams = {
  elm: VistaParsedElm;
  pos: number;
  index: number;
  maxZoomLevel: number;
  onScale: (par: { vistaImage: VistaBox; scale: number; isMax: boolean; isMin: boolean }) => void;
  vistaView: VistaView;
  transitionState?: VistaHiresTransitionOpt;
  transitionShouldWait?: () => boolean;
};

export type VistaParamsNeo = {
  elements: string | VistaImgConfig[];
} & VistaOpt;

export type VistaImageState = {
  _t: VistaBox;
  _width: number;
  _height: number;
  _transform: {
    x: number;
    y: number;
    scale: number;
  };
  _translate: {
    x: number;
    y: number;
  };
  _lessThanMinWidth: boolean;
  lessThanMinWidth: boolean;
  translate: {
    x: number;
    y: number;
  };
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  width: number;
  height: number;
};

export type VistaImageClone = {
  config: {
    src: string;
    alt?: string;
    srcSet?: string;
  };
  origin: {
    src: string;
    srcSet: string;
    borderRadius: string;
    objectFit: string;
  } | null;
  parsedSrcSet?: { src: string; width: number }[];
  element: string;
  thumb?: string;
  index: number;
  pos: number;
  state: {
    width: number;
    height: number;
    transform: {
      x: number;
      y: number;
      scale: number;
    };
    translate: {
      x: number;
      y: number;
    };
  };
};
