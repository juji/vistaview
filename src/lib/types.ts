import type { VistaView } from './vista-view';

export type VistaViewElmProps = {
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

export type VistaViewImage = {
  src: string;
  alt?: string;
  thumb?: string;
};

export type VistaViewImageIndexed = {
  index: number;
  imageElm?: HTMLImageElement;
  anchorElm?: HTMLAnchorElement;
} & VistaViewImage;

export type VistaViewOptions = {
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
    topLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
  };

  // events
  onImageView?: (params: VistaViewData) => void;
  onOpen?: (params: VistaViewData) => void;
  onClose?: (params: VistaViewData) => void;

  // uesr defined functions
  transitionFunction?: VistaViewTransitionFunction;
  setupFunction?: VistaViewSetupFunction;
  closeFunction?: VistaViewCloseFunction;
  initFunction?: VistaViewInitFunction;
};

export type VistaViewDefaultControls =
  | 'indexDisplay'
  | 'zoomIn'
  | 'zoomOut'
  | 'close'
  | 'description';

export type VistaViewCustomControl = {
  name: string;
  icon: string;
  onClick: (v: VistaViewImageIndexed) => void | Promise<void>;
};

export type VistaViewData = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaViewImageIndexed[] | null; to: VistaViewImageIndexed[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  container: HTMLElement;
  elements: NodeListOf<HTMLElement> | VistaViewImage[];
  isReducedMotion: boolean;
  isZoomed: HTMLImageElement | false;
  options: VistaViewOptions;
};

export type VistaViewTransitionFunction = (
  params: VistaViewData,
  abortSignal: AbortSignal
) => Promise<void>;

export type VistaViewSetupFunction = (params: VistaViewData) => void;
export type VistaViewCloseFunction = (vistaView: VistaView) => void;
export type VistaViewInitFunction = (vistaView: VistaView) => void;
