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
  onClick: (v: VistaViewImageIndexed) => void | Promise<void>;
};

export type UserFunctionParams = {
  htmlElements: { from: HTMLElement[] | null; to: HTMLElement[] | null };
  images: { from: VistaViewImageIndexed[] | null; to: VistaViewImageIndexed[] | null };
  index: { from: number | null; to: number | null };
  via: { next: boolean; prev: boolean };
  container: HTMLElement;
  elements: NodeListOf<HTMLElement> | VistaViewImage[];
  isReducedMotion: boolean;
};

export type UserTransitionFunction = (
  params: UserFunctionParams
) => VistaViewImageIndexed | Promise<VistaViewImageIndexed>;

export type UserSetupFunction = (params: UserFunctionParams) => void;
export type UserCloseFunction = (params: UserFunctionParams) => void;
