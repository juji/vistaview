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
  controls?: {
    topLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
  };
  onImageView?: (params: VistaViewData) => void;
  onOpen?: (params: VistaViewData) => void;
  onClose?: (params: VistaViewData) => void;
};

export type VistaViewDefaultControls =
  | 'indexDisplay'
  | 'zoomIn'
  | 'zoomOut'
  | 'download'
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
  navActive: boolean;
  isZoomed: HTMLImageElement | false;
};

export type VistaViewTransitionFunction = (
  params: VistaViewData
) => VistaViewImageIndexed | Promise<VistaViewImageIndexed>;

export type VistaViewSetupFunction = (params: VistaViewData) => void;
export type VistaViewCloseFunction = (params: VistaViewData) => void;
