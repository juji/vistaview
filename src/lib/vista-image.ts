// import { getStyleProps } from './utils/get-style-props';
// import { getFittedSize } from './utils/get-fitted-size';
import type { VistaImgConfig, VistaImgOrigin } from './types';
import { parseElement } from './utils/parse-element';
import { getFullSizeDim } from './utils/get-full-size-dim';
import { VistaHiresTransition } from './vista-hires-transition';
import type { VistaHiresTransitionOpt } from './vista-hires-transition';
// import { init } from '../vistaview';

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

  private state = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };

  private transform = {
    x: 0,
    y: 0,
    scale: 1,
  };

  private initPointerCenter = { x: 0, y: 0 };

  private transitionState: VistaHiresTransitionOpt | null = null;

  private transitionShouldWait = () => false;

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

  private onScale: (par: { scale: number; isMax: boolean; isMin: boolean }) => void = (_par) => {
    // do nothing
  };

  config: VistaImgConfig;
  origin: VistaImgOrigin | null = null;

  constructor(par: {
    elm: HTMLImageElement | HTMLAnchorElement | VistaImgConfig;
    pos: number;
    index: number;
    maxZoomLevel: number;
    onScale?: (par: { scale: number; isMax: boolean; isMin: boolean }) => void;
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
      this.image!.style.width = img.image!.style.width;
      this.image!.style.height = img.image!.style.height;
    }

    if (img.image!.classList.contains('vvw--ready')) {
      this.image!.classList.add('vvw--ready');
    }
    // console.log('VistaImage: cloneStyleFrom', this.image, img.image);
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
      img.style.width = `${this.transitionState.current.width}px`;
      img.style.height = `${this.transitionState.current.height}px`;
    } else if (!img.classList.contains('vvw--loaded')) {
      img.style.width = this.initW + 'px';
      img.style.height = this.initH + 'px';
    }

    // if(this.pos === 0) console.log('VistaImage: Image loaded', img, {
    //   initW: this.initW,
    //   initH: this.initH,
    //   fullW: this.fullW,
    //   fullH: this.fullH,
    //   initRad: this.initRad,
    // }, img.classList.toString());

    const animateIn = () => {
      if (this.isCancelled) return;
      VistaHiresTransition.start({
        img,
        options: this.transitionState || {
          current: {
            width: this.initW,
            height: this.initH,
          },
          target: {
            width: this.fullW,
            height: this.fullH,
          },
          // log: this.pos === 0
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

    // why does this need to be delayed?
    // i dont know...
    // this makes the transitionend event can be captured properly
    if (img.classList.contains('vvw--loaded')) {
      if (!img.classList.contains('vvw--ready')) {
        animateIn();
      }
    } else {
      img.addEventListener(
        'transitionend',
        () => {
          animateIn();
        },
        { once: true }
      );

      img.classList.add('vvw--loaded');
      // animateIn();
      // setTimeout(() => {
      //   if( this.isCancelled ) return;
      // }, 777);
    }

    // even this one fails
    // requestAnimationFrame(() => {
    //   requestAnimationFrame(() => {
    //     requestAnimationFrame(() => {
    //       requestAnimationFrame(() => {
    //         requestAnimationFrame(() => {
    //           if( this.isCancelled ) return;
    //           img.classList.add('vvw--loaded');
    //         });
    //       })
    //     })
    //   })
    // });
    // this.onImageLoaded();
  }

  prepareClose() {
    if (!this.isLoaded || !this.image) return;
    VistaHiresTransition.stop(this.image);
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
    this.transform = { x: 0, y: 0, scale: 1 };
    this.state = {
      x: 0,
      y: 0,
      width: this.fullW,
      height: this.fullH,
    };
    this.isZoomedIn = false;
    const img = this.image!;
    img.style.width = this.fullW + 'px';
    img.style.height = this.fullH + 'px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '0';
    img.style.translate = `50% 50%`;
    img.style.transform = ``;
  }

  cancelPendingLoad() {
    this.isCancelled = true;
    this.image?.classList.add('vvw--load-cancelled');
  }

  setTransform({ x, y, scale }: { x: number; y: number; scale: number }) {
    this.transform = { x, y, scale };
    const img = this.image!;
    const transform = `translate3d(${x}px, ${y}px, 0px) scale3d(${scale}, ${scale}, 1)`;
    img.style.transform = transform;
  }

  setInitialCenter(center: { x: number; y: number }) {
    this.initPointerCenter = center;
  }

  move(center: { x: number; y: number }) {
    const deltaX = center.x - this.initPointerCenter.x;
    const deltaY = center.y - this.initPointerCenter.y;
    this.setTransform({
      x: deltaX,
      y: deltaY,
      scale: this.transform.scale,
    });
  }

  scaleMove(scaleFactor: number, center?: { x: number; y: number }) {
    if (!center) {
      center = this.initPointerCenter;
    }

    const img = this.image!;
    const rect = img.getBoundingClientRect();
    let newScale = this.transform.scale * scaleFactor;
    if (rect.width * newScale > this.maxW) {
      newScale = this.maxW / rect.width;
    }

    // calculate the position to keep the zoom centered at the pinch center
    const imgCenter = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const offsetX = (center.x - imgCenter.x) * (newScale / this.transform.scale - 1);
    const offsetY = (center.y - imgCenter.y) * (newScale / this.transform.scale - 1);

    this.setTransform({
      x: this.transform.x - offsetX,
      y: this.transform.y - offsetY,
      scale: newScale,
    });

    // notify scale change
    const scaledWidth = rect.width * newScale;
    this.isZoomedIn = scaledWidth > this.fullW;
    this.onScale({
      scale: scaledWidth / this.fullW,
      isMax: scaledWidth >= this.maxW,
      isMin: scaledWidth <= this.fullW,
    });
  }

  animateZoom(targetScale: number, center?: { x: number; y: number }) {
    const img = this.image!;
    const rect = img.getBoundingClientRect();
    const initialScale = this.transform.scale;
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
        offsetX = (center.x - imgCenter.x) * (currentScale / this.transform.scale - 1);
        offsetY = (center.y - imgCenter.y) * (currentScale / this.transform.scale - 1);
      }

      this.setTransform({
        x: this.transform.x - offsetX,
        y: this.transform.y - offsetY,
        scale: currentScale,
      });

      if (progress < 1) {
        requestAnimationFrame(() => animate(progress + 0.1));
      } else {
        // notify scale change
        const scaledWidth = rect.width * targetScale;
        this.isZoomedIn = scaledWidth > this.fullW;
        this.onScale({
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
        img,
        options: {
          current: {
            x: this.transform.x,
            y: this.transform.y,
          },
          target: {
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
      this.transform.x += par.x;
      this.transform.y += par.y;

      const bound = img.getBoundingClientRect();

      this.transform.x = this.transform.x + par.x;
      this.transform.y = this.transform.y + par.y;

      if (bound.right < window.innerWidth / 2) {
        this.transform.x += (window.innerWidth / 2 - bound.right) * 0.1;
        par.x *= 0.7;
      }
      if (bound.left > window.innerWidth / 2) {
        this.transform.x -= (bound.left - window.innerWidth / 2) * 0.1;
        par.x *= 0.7;
      }
      if (bound.bottom < window.innerHeight / 2) {
        this.transform.y += (window.innerHeight / 2 - bound.bottom) * 0.1;
        par.y *= 0.7;
      }
      if (bound.top > window.innerHeight / 2) {
        this.transform.y -= (bound.top - window.innerHeight / 2) * 0.1;
        par.y *= 0.7;
      }

      this.setTransform(this.transform);
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
    this.state.x += this.transform.x;
    this.state.y += this.transform.y;
    this.state.width *= this.transform.scale;
    this.state.height *= this.transform.scale;

    if (Math.abs(this.state.width - this.fullW) < 1) {
      this.state.width = this.fullW;
      this.state.height = this.fullH;
    }

    if (Math.abs(this.state.x) < 1) {
      this.state.x = 0;
    }

    if (Math.abs(this.state.y) < 1) {
      this.state.y = 0;
    }

    this.transform = { x: 0, y: 0, scale: 1 };

    // normalize if zoomed out
    if (
      this.state.width === this.fullW &&
      this.state.height === this.fullH &&
      this.state.x === 0 &&
      this.state.y === 0
    ) {
      this.normalize();
    } else {
      const img = this.image!;
      img.style.width = `${this.state.width}px`;
      img.style.height = `${this.state.height}px`;
      img.style.translate = `calc(50% + ${this.state.x}px) calc(50% + ${this.state.y}px)`;
      img.style.transform = ``;
    }

    // determine if this should be closed
    return this.state.width < this.minW;
  }
}
