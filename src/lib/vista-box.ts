import type {
  VistaImageState,
  VistaImgConfig,
  VistaImageParams,
  VistaImgOrigin,
  VistaImageClone,
} from './types';
import type { VistaHiresTransitionOpt } from './vista-hires-transition';
import type { VistaView } from './vista-view';
import { getFittedSize } from './utils/get-fitted-size';
import { VistaHiresTransition } from './vista-hires-transition';

export abstract class VistaBox {
  abstract element: HTMLImageElement | HTMLDivElement;

  state: VistaImageState;

  parsedSrcSet: { src: string; width: number }[] | undefined = undefined;
  isReady: boolean = false;
  isThrowing: boolean = false;
  thumb: HTMLDivElement | null = null;
  pos: number;
  index: number;
  config: VistaImgConfig;
  origin: VistaImgOrigin | undefined = undefined;

  protected initH: number = 0;
  protected initW: number = 0;
  protected fullH: number = 0;
  protected fullW: number = 0;
  protected maxW: number = 0;
  protected minW: number = 0;
  protected defaultWH: number = 200;

  protected isZoomedIn: boolean = false;
  protected isCancelled: boolean = false;
  protected isLoadedResolved: ((val: boolean | PromiseLike<boolean>) => void) | null = null;
  protected isLoadedRejected: ((reason?: any) => void) | null = null;
  protected isLoaded: Promise<boolean> = new Promise((res, rej) => {
    this.isLoadedResolved = res;
    this.isLoadedRejected = rej;
  });

  protected replacement: HTMLImageElement | null = null;
  protected originalParent: HTMLElement | null = null;
  protected originalNextSibling: ChildNode | null = null;
  protected originalStyle = '';
  protected thumbImage: HTMLImageElement | null = null;
  protected originRect: { width: number; height: number; top: number; left: number } = {
    width: this.defaultWH,
    height: this.defaultWH,
    top: 0,
    left: 0,
  };
  protected fittedSize: { width: number; height: number } | null = null;

  protected maxZoomLevel: number;
  protected vistaView: VistaView;
  protected transitionState: VistaHiresTransitionOpt | null = null;
  protected transitionShouldWait: () => boolean = () => false;
  protected initPointerCenter = { x: 0, y: 0 };
  protected onScale: (par: {
    vistaImage: VistaBox;
    scale: number;
    isMax: boolean;
    isMin: boolean;
  }) => void;

  constructor(par: VistaImageParams) {
    this.state = this.createState();
    this.pos = par.pos;
    this.index = par.index;
    this.config = par.elm.config;
    this.parsedSrcSet = par.elm.parsedSrcSet;
    this.origin = par.elm.origin;
    this.maxZoomLevel = par.maxZoomLevel;
    this.vistaView = par.vistaView;
    this.onScale = par.onScale;

    if (par.transitionState) {
      this.transitionState = par.transitionState;
    }

    if (par.transitionShouldWait) {
      this.transitionShouldWait = par.transitionShouldWait;
    }

    // set initial center`
    this.initPointerCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };

    // set thumbnail
    const thumb = this.pos === 0 ? this.origin?.image : null;
    this.originalParent = thumb?.parentElement || null;
    this.originalNextSibling = thumb?.nextSibling || null;
    this.originRect = (this.origin?.anchor || thumb)?.getBoundingClientRect() || {
      width: this.defaultWH,
      height: this.defaultWH,
      top: 0,
      left: 0,
    };

    // setup thumb styling
    if (thumb && this.originalParent) {
      this.originalStyle = thumb.style.cssText;
      this.thumbImage = thumb;
      const replacement = thumb.cloneNode(true) as HTMLImageElement;
      this.originalParent.insertBefore(replacement, thumb);
      this.replacement = replacement;

      this.thumb = document.createElement('div');
      this.thumb.classList.add('vvw-img-lo');

      const { width, height } = this.thumbImage
        ? getFittedSize(this.thumbImage)
        : { width: 0, height: 0 };

      this.fittedSize = { width, height };
      this.thumb.appendChild(thumb);
      thumb.style.width = '100%';
      thumb.style.height = '100%';
      thumb.style.objectFit = this.origin!.objectFit;
    }
  }

  protected createState(): VistaImageState {
    const self = this;

    return {
      _t: this,
      _width: 0,
      _height: 0,
      _transform: { x: 0, y: 0, scale: 1 },
      _translate: { x: 0, y: 0 },
      _lessThanMinWidth: false,

      get width() {
        return this._width;
      },
      set width(value: number) {
        this._width = value;
        self.onWidthChange(value);
      },

      get height() {
        return this._height;
      },
      set height(value: number) {
        this._height = value;
        self.onHeightChange(value);
      },

      get transform() {
        return this._transform;
      },
      set transform(value: { x: number; y: number; scale: number }) {
        this._transform = value;
        self.onTransformChange(value);
      },

      get translate() {
        return this._translate;
      },
      set translate(value: { x: number; y: number }) {
        this._translate = value;
        self.onTranslateChange(value);
      },

      get lessThanMinWidth() {
        return this._lessThanMinWidth;
      },
      set lessThanMinWidth(value: boolean) {
        this._lessThanMinWidth = value;
        self.onLessThanMinWidthChange(value);
      },
    } as VistaImageState;
  }

  protected onLessThanMinWidthChange(value: boolean): void {
    if (value) {
      this.element!.style.opacity = `0.5`;
    } else {
      this.element!.style.opacity = ``;
    }
  }

  protected onTranslateChange(value: { x: number; y: number }): void {
    this.element!.style.translate = `calc(-50% + ${value.x}px) calc(-50% + ${value.y}px)`;
  }

  protected onTransformChange(value: { x: number; y: number; scale: number }): void {
    const transform = `translate3d(${value.x}px, ${value.y}px, 0px) scale3d(${value.scale}, ${value.scale}, 1)`;
    this.element!.style.transform = transform;
  }

  protected onWidthChange(value: number): void {
    this.element!.style.width = `${value}px`;
  }

  protected onHeightChange(value: number): void {
    this.element!.style.height = `${value}px`;
  }

  onImageReady(): void {}
  animateZoom(_scaleFactor: number, _center?: { x: number; y: number }): void {}
  scaleMove(_scaleFactor: number, _center?: { x: number; y: number }, _animate?: boolean): void {}
  momentumThrow(_par: { x: number; y: number }): () => void {
    return () => {};
  }

  async init() {
    await this.isLoaded;

    const img = this.element!;

    if (
      this.transitionState &&
      this.transitionState.current.width &&
      this.transitionState.current.height
    ) {
      this.state.width = this.transitionState.current.width;
      this.state.height = this.transitionState.current.height;
    } else if (!img.classList.contains('vvw--loaded')) {
      this.state.width = this.initW;
      this.state.height = this.initH;
    }

    const animateIn = () => {
      if (this.isCancelled) return;
      VistaHiresTransition.start({
        vistaImage: this,
        target: {
          width: this.fullW,
          height: this.fullH,
        },
        onComplete: () => {
          if (this.isCancelled) return;
          this.isReady = true;
          img.classList.add('vvw--ready');
          this.onImageReady();
        },
        shouldWait: this.transitionShouldWait,
      });
    };

    if (this.pos < -1 || this.pos > 1) {
      // dont animate if the image will never be in view
      this.state.width = this.fullW;
      this.state.height = this.fullH;
      img.classList.add('vvw--loaded');
      img.classList.add('vvw--ready');
      this.isReady = true;
    } else {
      if (img.classList.contains('vvw--loaded')) {
        if (!img.classList.contains('vvw--ready')) {
          animateIn();
        } else {
          this.isReady = true;
          this.onImageReady();
        }
      } else {
        img.classList.add('vvw--loaded');
        // requestAnimationFrame(() => { animateIn(); });
        // i found settimeout looks better, than requestAnimationFrame
        setTimeout(() => {
          // return to prevent scaled image on rapid slide
          if (this.isCancelled) return;
          animateIn();
        }, 333);
      }
    }
  }

  protected getFullSizeDim(): { width: number; height: number } {
    // get thumbnail size
    const { width, height } = this.thumb!.getBoundingClientRect();

    // calculate full size based on aspect ratio
    const thumbAspect = width / height;
    let fullWidth = window.innerWidth;
    let fullHeight = window.innerHeight;

    if (thumbAspect > window.innerWidth / window.innerHeight) {
      // wider than screen
      fullHeight = fullWidth / thumbAspect;
    } else {
      // taller than screen
      fullWidth = fullHeight * thumbAspect;
    }

    return { width: fullWidth, height: fullHeight };
  }

  setSizes(par: { stableSize?: boolean; initDimension?: boolean } = {}) {
    const { stableSize = true, initDimension } = par;

    if (!this.origin) return;

    const thumb = this.thumb;

    if (!initDimension) {
      this.originRect = (this.origin?.anchor || this.thumbImage)?.getBoundingClientRect() || {
        width: this.defaultWH,
        height: this.defaultWH,
        top: 0,
        left: 0,
      };
    }

    let dim = this.originRect;

    if (thumb) {
      const ts = thumb!.style;
      ts.width = dim.width + 'px';
      ts.height = dim.height + 'px';
      ts.top = '50%';
      ts.left = '50%';
      ts.translate = '-50% -50%';
      ts.position = 'fixed';
      ts.objectFit = this.origin!.objectFit;
      ts.borderRadius = this.origin!.borderRadius;

      const translateLeft =
        Math.min(Math.max(dim.left, -dim.width), window.innerWidth + dim.width) -
        window.innerWidth / 2 +
        dim.width / 2;
      const translateTop =
        Math.min(Math.max(dim.top, -dim.height), window.innerHeight + dim.height) -
        window.innerHeight / 2 +
        dim.height / 2;

      ts.setProperty('--vvw-init-radius', ts.borderRadius);
      ts.setProperty('--vvw-pulse-radius', `calc(1.3 * ${ts.borderRadius})`);
      ts.setProperty('--vvw-init-x', `${translateLeft}px`);
      ts.setProperty('--vvw-init-y', `${translateTop}px`);

      if (initDimension) {
        ts.setProperty('--vvw-current-x', `${translateLeft}px`);
        ts.setProperty('--vvw-current-y', `${translateTop}px`);
      }
    }

    if (!initDimension) {
      // recaluculate fitted size
      const { width, height } = this.thumbImage
        ? getFittedSize(this.thumbImage)
        : { width: 0, height: 0 };
      this.fittedSize = { width, height };
    }

    // update hires data
    const img = this.element!;
    this.initW = Math.min(this.fittedSize?.width ?? 0, dim.width);
    this.initH = Math.min(this.fittedSize?.height ?? 0, dim.height);
    img.style.setProperty('--vvw-init-w', this.initW + 'px');
    img.style.setProperty('--vvw-init-h', this.initH + 'px');
    img.style.setProperty('--vvw-init-radius', this.origin!.borderRadius);
    img.style.objectFit = 'cover';

    if (!initDimension) {
      // setting initDimension to true will prevent this from happening,
      // e.g., when called from constructor, sizes will not be set here

      // update full size in case of screen-size/orientation change
      if (this.isReady && !this.isCancelled) {
        const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();
        this.fullH = fullHeight;
        this.fullW = fullWidth;
        this.minW = this.fullW * 0.5;
      }

      // when not zoomed in, reset to initial size
      if (!this.isZoomedIn && stableSize) {
        this.normalize();
      }
    }
  }

  protected normalize() {
    this.state.transform = { x: 0, y: 0, scale: 1 };
    this.state.translate = {
      x: 0,
      y: 0,
    };
    this.state.width = this.fullW;
    this.state.height = this.fullH;
    this.isZoomedIn = false;
  }

  protected getFromParsedSrcSet(targetWidth: number): string | null {
    if (!this.parsedSrcSet || this.parsedSrcSet.length === 0) {
      return null;
    }

    // Account for device pixel ratio (DPI) for high-resolution displays
    const targetWidthWithDPR = targetWidth * (window.devicePixelRatio || 1);

    // find the closest width that is greater than or equal to targetWidth
    // assuming the items is sorted by width ascending
    let selected = this.parsedSrcSet[this.parsedSrcSet.length - 1];
    for (const item of this.parsedSrcSet) {
      if (item.width >= targetWidthWithDPR) {
        selected = item;
        break;
      }
    }
    return selected.src;
  }

  prepareClose() {
    VistaHiresTransition.stop(this);

    // finalize position
    this.setFinalTransform();
  }

  cancelPendingLoad() {
    this.isCancelled = true;
    this.element?.classList.add('vvw--load-cancelled');
  }

  // Used by: VistaImageEvent
  setInitialCenter(center: { x: number; y: number }) {
    this.initPointerCenter = center;
  }

  destroy() {
    // place image on it's place

    if (this.originalParent && this.thumbImage) {
      this.thumbImage.style.cssText = this.originalStyle;
      if (this.originalNextSibling) {
        this.originalParent.insertBefore(this.thumbImage, this.originalNextSibling);
      } else {
        this.originalParent.appendChild(this.thumbImage);
      }
    }

    this.originalParent = null;
    this.originalNextSibling = null;
    this.originalStyle = '';
    this.thumbImage = null;

    if (this.replacement) {
      this.replacement.remove();
      this.replacement = null;
    }

    // remove images from dom
    this.thumb?.remove();
    this.element?.remove();

    // clean up references
    this.thumb = null;
    this.origin = undefined;
    this.config = { src: '', alt: '' };
  }

  cloneStyleFrom(img: VistaBox, state?: VistaHiresTransitionOpt): void {
    if (!img?.element) return;

    if (state) {
      this.transitionState = state || null;
    }

    if (img.element.classList.contains('vvw--loaded')) {
      this.element.classList.add('vvw--loaded');
      this.state.width = img.state.width;
      this.state.height = img.state.height;
    }

    if (img.element.classList.contains('vvw--ready')) {
      this.element.classList.add('vvw--ready');
    }
  }

  toObject(): VistaImageClone {
    return structuredClone({
      config: {
        src: this.config.src,
        alt: this.config.alt,
        srcSet: this.config.srcSet,
      },
      origin: this.origin
        ? {
            src: this.origin.src,
            srcSet: this.origin.srcSet,
            borderRadius: this.origin.borderRadius,
            objectFit: this.origin.objectFit,
          }
        : null,
      parsedSrcSet: this.parsedSrcSet,
      element: 'src' in this.element ? this.element.src : this.element.toString(),
      thumb: undefined,
      index: this.index,
      pos: this.pos,
      state: {
        width: this.state._width,
        height: this.state._height,
        transform: this.state._transform,
        translate: this.state._translate,
      },
    });
  }

  // Used by: VistaImageEvent
  setFinalTransform(par: { propagateEvent?: boolean } = {}) {
    const { propagateEvent = true } = par;

    if (!this.isReady) return;

    // finalize current transform into translate and size
    this.state.translate.x += this.state.transform.x;
    this.state.translate.y += this.state.transform.y;
    this.state.width *= this.state.transform.scale;
    this.state.height *= this.state.transform.scale;

    // limits
    if (Math.abs(this.state.width - this.fullW) < 1) {
      this.state.width = this.fullW;
      this.state.height = this.fullH;
    }

    if (Math.abs(this.state.translate.x) < 1) {
      this.state.translate.x = 0;
    }

    if (Math.abs(this.state.translate.y) < 1) {
      this.state.translate.y = 0;
    }

    // trigger updates
    this.state.translate = { ...this.state.translate };
    this.state.transform = { x: 0, y: 0, scale: 1 };

    if (propagateEvent) {
      const obj = this.toObject();
      this.vistaView.options.onContentChange &&
        this.vistaView.options.onContentChange(obj, this.vistaView);
      this.vistaView.state.extensions.forEach((ext) => {
        ext.onContentChange && ext.onContentChange(obj, this.vistaView);
      });
    }

    return {
      close: true,
      cancel: () => {},
    };
  }
}
