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
  controls?: {
    topLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
  };
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
  onClick: (v: VistaViewImageIndexed) => void;
};

export type UserTransitionFunctionParams = {
  htmlElements: { from: HTMLElement[]; to: HTMLElement[] };
  images: { from: VistaViewImageIndexed[]; to: VistaViewImageIndexed[] };
  index: { from: number; to: number };
  via: { next: boolean; prev: boolean };
  container: HTMLElement;
};

export type UserTransitionFunction = (
  params: UserTransitionFunctionParams
) => Promise<VistaViewImageIndexed>;
