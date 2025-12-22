// import { getStyleProps } from './utils/get-style-props';
// import { getFittedSize } from './utils/get-fitted-size';
import type { VistaImgConfig, VistaImgOrigin } from './types';
import { parseElement } from './utils/parse-element';
import { getFullSizeDim } from './utils/get-full-size-dim';
import { VistaHiresTransition } from './vista-hires-transition';
import type { VistaHiresTransitionOpt } from './vista-hires-transition';
// import { init } from '../vistaview';

export type VistaImageState = {
  _t: VistaImage;
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

export class VistaImage {
  private initH: number = 0;
  private initW: number = 0;
  private fullH: number = 0;
  private fullW: number = 0;
  // private maxH: number = 0
  private maxW: number = 0;
  // private minH: number = 0
  private minW: number = 0;
  // private initRad: string = '0px'
  private maxZoomLevel: number = 1;

  state: VistaImageState = {
    _t: this,
    _width: 0,
    _height: 0,
    _transform: {
      x: 0,
      y: 0,
      scale: 1,
    },
    _translate: {
      x: 0,
      y: 0,
    },
    set translate(value: { x: number; y: number }) {
      this._translate = value;
      this._t.image!.style.translate = `${value.x}px ${value.y}px`;
    },
    get translate() {
      return this._translate;
    },
    set transform(value: { x: number; y: number; scale: number }) {
      this._transform = value;
      const transform = `translate3d(${value.x}px, ${value.y}px, 0px) scale3d(${value.scale}, ${value.scale}, 1)`;
      this._t.image!.style.transform = transform;
    },
    get transform() {
      return this._transform;
    },
    set width(value: number) {
      this._width = value;
      this._t.image!.style.width = `${value}px`;
    },
    get width() {
      return this._width;
    },
    set height(value: number) {
      this._height = value;
      this._t.image!.style.height = `${value}px`;
    },
    get height() {
      return this._height;
    },
  };

  private initPointerCenter = { x: 0, y: 0 };

  private transitionState: VistaHiresTransitionOpt | null = null;

  private transitionShouldWait = () => false;

  private onScale: (par: {
    vistaImage: VistaImage;
    scale: number;
    isMax: boolean;
    isMin: boolean;
  }) => void = (_par) => {
    // do nothing
  };

  isZoomedIn: boolean = false;
  isThrowing: boolean = false;
  isError: boolean = false;
  isReady: boolean = false;
  isCancelled: boolean = false;

  isLoadedResolved: ((val: boolean | PromiseLike<boolean>) => void) | null = null;
  isLoadedRejected: ((reason?: any) => void) | null = null;
  isLoaded: Promise<boolean> = new Promise((res, rej) => {
    this.isLoadedResolved = res;
    this.isLoadedRejected = rej;
  });

  image: HTMLImageElement | null = null;
  thumb: HTMLImageElement | null = null;
  pos: number;
  index: number;

  config: VistaImgConfig;
  origin: VistaImgOrigin | null = null;

  constructor(par: {
    elm: HTMLImageElement | HTMLAnchorElement | VistaImgConfig;
    pos: number;
    index: number;
    maxZoomLevel: number;
    onScale?: (par: {
      vistaImage: VistaImage;
      scale: number;
      isMax: boolean;
      isMin: boolean;
    }) => void;
    transitionState?: VistaHiresTransitionOpt;
    transitionShouldWait?: () => boolean;
  }) {
    if (par.onScale) this.onScale = par.onScale;

    this.pos = par.pos;
    this.index = par.index;
    this.maxZoomLevel = par.maxZoomLevel;

    if (par.transitionState) {
      this.transitionState = par.transitionState;
    }

    if (par.transitionShouldWait) {
      this.transitionShouldWait = par.transitionShouldWait;
    }

    const conf =
      par.elm instanceof HTMLElement ? parseElement(par.elm) : { config: par.elm, origin: null };

    this.config = conf.config;
    this.origin = conf.origin;

    this.createPreview();

    // trigger setSizes to setup thumb and hires image
    // stableSize = false
    // initDimension = true
    this.setSizes(false, true);

    // set initial center`
    this.initPointerCenter = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  cloneStyleFrom(img: VistaImage, state?: VistaHiresTransitionOpt) {
    if (!img?.image) return;

    // console.log('VistaImage: cloneStyleFrom', {img, state})

    if (state) {
      this.transitionState = state || null;
    }

    if (img.image!.classList.contains('vvw--loaded')) {
      this.image!.classList.add('vvw--loaded');
      this.state.width = img.state.width;
      this.state.height = img.state.height;
      this.fullH = img.fullH;
      this.fullW = img.fullW;
      this.initH = img.initH;
      this.initW = img.initW;
      this.minW = img.minW;
      this.maxW = img.maxW;
    }

    if (img.image!.classList.contains('vvw--ready')) {
      this.image!.classList.add('vvw--ready');
    }
    console.log('VistaImage: cloneStyleFrom', this.image, img.image);
  }

  private createPreview() {
    const thumb = document.createElement('img');
    thumb.src = this.origin?.src || this.config.src;
    thumb.alt = this.config.alt || '';
    thumb.srcset = this.origin?.srcSet || this.config.srcSet || '';
    thumb.classList.add('vvw-img-lo');
    this.thumb = thumb;

    // width and height
    const origin = this.origin?.image;

    if (origin && origin.width && origin.height) {
      thumb.width = origin.width;
      thumb.height = origin.height;
    } else {
      thumb.width = 200;
      thumb.height = 200;
    }

    //
    const img = document.createElement('img');
    img.alt = this.config.alt || '';
    img.srcset = this.config.srcSet || '';
    img.classList.add('vvw-img-hi');
    this.image = img;

    img.onerror = (e) => {
      this.isError = true;
      // this.onImageError(e);
      this.isLoadedRejected!(e);
    };

    img.src = this.config.src;

    img
      .decode()
      .then(() => {
        this.onLoad();
      })
      .catch((e) => {
        this.isError = true;
        this.isLoadedRejected!(e);
      });
  }

  private onLoad() {
    if (this.isCancelled) return;

    const img = this.image!;

    img.width = img.naturalWidth;
    img.height = img.naturalHeight;

    // set max zoomed dimensions
    // this.maxH = img.naturalHeight * this.maxZoomLevel;
    this.maxW = img.naturalWidth * this.maxZoomLevel;

    // set fullscreen dimensions
    const { width: fullWidth, height: fullHeight } = getFullSizeDim(img);
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.3;
    // this.minH = this.fullH * 0.3

    this.isLoadedResolved!(true);
  }

  async waitForLoad() {
    await this.isLoaded;

    const img = this.image!;

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
          // this.onImageReady();
        },
        shouldWait: this.transitionShouldWait,
      });
    };

    if (img.classList.contains('vvw--loaded')) {
      if (!img.classList.contains('vvw--ready')) {
        animateIn();
      }
    } else {
      if (this.pos === 0) console.log('Adding transitionend listener');

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

  prepareClose() {
    if (!this.isLoaded || !this.image) return;
    VistaHiresTransition.stop(this);
  }

  destroy() {
    // remove images from dom
    this.thumb?.remove();
    this.image?.remove();

    // clean up references
    this.thumb = null;
    this.image = null;
  }

  setSizes(stableSize: boolean = true, initDimension?: boolean) {
    if (!this.origin) return;

    const thumb = this.thumb;
    const dim = (this.origin!.anchor || this.origin!.image).getBoundingClientRect() || {
      width: 200,
      height: 200,
      top: 0,
      left: 0,
    };

    // update thumb styles
    const ts = thumb!.style;
    thumb!.width = dim.width;
    thumb!.height = dim.height;
    ts.width = dim.width + 'px';
    ts.height = dim.height + 'px';
    ts.objectFit = this.origin!.objectFit;
    ts.borderRadius = this.origin!.borderRadius;

    // this.initRad = im.origin!.borderRadius;

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

    // update hires data
    const img = this.image!;

    if (initDimension) {
      img.style.objectFit = 'cover';
      img.style.setProperty('--vvw-init-radius', this.origin!.borderRadius);
      img.style.setProperty('--vvw-init-w', dim.width + 'px');
      img.style.setProperty('--vvw-init-h', dim.height + 'px');
      this.initW = dim.width;
      this.initH = dim.height;
    } else {
      // setting initDimension to true will prevent this from happening,

      // e.g., when called from constructor, sizes will not be set here
      const { width: fullWidth, height: fullHeight } = getFullSizeDim(this.image!);
      this.fullH = Math.min(dim.width, fullWidth);
      this.fullW = Math.min(dim.height, fullHeight);

      // set sizes attribute for better loading performance?
      // img.sizes = `${this.fullW}px`;

      // when not zoomed in, reset to initial size
      if (!this.isZoomedIn && stableSize) {
        this.normalize();
      }
    }
  }

  normalize() {
    this.state.transform = { x: 0, y: 0, scale: 1 };
    this.state.translate = {
      x: 0,
      y: 0,
    };
    this.state.width = this.fullW;
    this.state.height = this.fullH;
    this.isZoomedIn = false;
    const img = this.image!;
    img.style.objectFit = 'cover';
    img.style.borderRadius = '0';
  }

  cancelPendingLoad() {
    this.isCancelled = true;
    this.image?.classList.add('vvw--load-cancelled');
  }

  setInitialCenter(center: { x: number; y: number }) {
    this.initPointerCenter = center;
  }

  move(center: { x: number; y: number }) {
    const deltaX = center.x - this.initPointerCenter.x;
    const deltaY = center.y - this.initPointerCenter.y;
    this.state.transform = {
      x: deltaX,
      y: deltaY,
      scale: this.state.transform.scale,
    };
  }

  scaleMove(scaleFactor: number, center?: { x: number; y: number }) {
    if (!center) {
      center = this.initPointerCenter;
    }

    const img = this.image!;
    const rect = img.getBoundingClientRect();
    let newScale = this.state.transform.scale * scaleFactor;
    if (rect.width * newScale > this.maxW) {
      newScale = this.maxW / rect.width;
    }

    // calculate the position to keep the zoom centered at the pinch center
    const imgCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const offsetX = (center.x - imgCenter.x) * (newScale / this.state.transform.scale - 1);
    const offsetY = (center.y - imgCenter.y) * (newScale / this.state.transform.scale - 1);

    this.state.transform = {
      x: this.state.transform.x - offsetX,
      y: this.state.transform.y - offsetY,
      scale: newScale,
    };

    // notify scale change
    const scaledWidth = rect.width * newScale;
    this.isZoomedIn = scaledWidth > this.fullW;
    this.onScale({
      vistaImage: this,
      scale: scaledWidth / this.fullW,
      isMax: scaledWidth >= this.maxW,
      isMin: scaledWidth <= this.fullW,
    });
  }

  animateZoom(targetScale: number, center?: { x: number; y: number }) {
    const img = this.image!;
    const rect = img.getBoundingClientRect();
    const initialScale = this.state.transform.scale;
    const scaleDiff = targetScale - initialScale;

    const animate = (progress: number) => {
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2; // easeInOut
      const currentScale = initialScale + scaleDiff * easedProgress;

      // calculate the position to keep the zoom centered at the pinch center
      let offsetX = 0;
      let offsetY = 0;
      if (center) {
        const imgCenter = {
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
        };
        offsetX = (center.x - imgCenter.x) * (currentScale / this.state.transform.scale - 1);
        offsetY = (center.y - imgCenter.y) * (currentScale / this.state.transform.scale - 1);
      }

      this.state.transform = {
        x: this.state.transform.x - offsetX,
        y: this.state.transform.y - offsetY,
        scale: currentScale,
      };

      if (progress < 1) {
        requestAnimationFrame(() => animate(progress + 0.1));
      } else {
        // notify scale change
        const scaledWidth = rect.width * targetScale;
        this.isZoomedIn = scaledWidth > this.fullW;
        this.onScale({
          vistaImage: this,
          scale: scaledWidth / this.fullW,
          isMax: scaledWidth >= this.maxW,
          isMin: scaledWidth <= this.fullW,
        });
      }
    };

    animate(0);
  }

  momentumThrow(par: { x: number; y: number }) {
    if (!this.isThrowing) {
      this.setFinalTransform();
      return () => {
        this.isThrowing = false;
      };
    }

    if (Math.abs(par.x) < 0.1 && Math.abs(par.y) < 0.1) {
      const img = this.image!;
      const bound = img.getBoundingClientRect();
      VistaHiresTransition.start({
        vistaImage: this,
        target: {
          transform: {
            x:
              bound.right < window.innerWidth / 2
                ? window.innerWidth / 2 - bound.right
                : bound.left > window.innerWidth / 2
                  ? -(bound.left - window.innerWidth / 2)
                  : 0,
            y:
              bound.bottom < window.innerHeight / 2
                ? window.innerHeight / 2 - bound.bottom
                : bound.top > window.innerHeight / 2
                  ? -(bound.top - window.innerHeight / 2)
                  : 0,
          },
        },
        onComplete: () => {
          this.isThrowing = false;
          this.setFinalTransform();
        },
        shouldWait: () => false,
      });
      return () => {
        this.isThrowing = false;
      };
    }

    requestAnimationFrame(() => {
      if (!this.isThrowing) return this.momentumThrow({ x: 0, y: 0 });

      const img = this.image!;
      const t = this.state.transform;
      t.x += par.x;
      t.y += par.y;

      const bound = img.getBoundingClientRect();

      t.x = t.x + par.x;
      t.y = t.y + par.y;

      if (bound.right < window.innerWidth / 2) {
        t.x += (window.innerWidth / 2 - bound.right) * 0.1;
        par.x *= 0.7;
      }
      if (bound.left > window.innerWidth / 2) {
        t.x -= (bound.left - window.innerWidth / 2) * 0.1;
        par.x *= 0.7;
      }
      if (bound.bottom < window.innerHeight / 2) {
        t.y += (window.innerHeight / 2 - bound.bottom) * 0.1;
        par.y *= 0.7;
      }
      if (bound.top > window.innerHeight / 2) {
        t.y -= (bound.top - window.innerHeight / 2) * 0.1;
        par.y *= 0.7;
      }

      this.state.transform = t;

      this.momentumThrow({
        x: par.x * 0.95,
        y: par.y * 0.95,
      });
    });

    return () => {
      this.isThrowing = false;
    };
  }

  setFinalTransform() {
    this.state.translate.x += this.state.transform.x;
    this.state.translate.y += this.state.transform.y;
    this.state.width *= this.state.transform.scale;
    this.state.height *= this.state.transform.scale;

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

    this.state.transform = { x: 0, y: 0, scale: 1 };

    // normalize if zoomed out
    if (
      this.state.width === this.fullW &&
      this.state.height === this.fullH &&
      this.state.translate.x === 0 &&
      this.state.translate.y === 0
    ) {
      this.normalize();
    }
    // else {
    //   const img = this.image!;
    //   img.style.width = `${this.state.width}px`;
    //   img.style.height = `${this.state.height}px`;
    //   img.style.translate = `calc(50% + ${this.state.x}px) calc(50% + ${this.state.y}px)`;
    //   img.style.transform = ``;
    // }

    // determine if this should be closed
    return this.state.width < this.minW;
  }
}
