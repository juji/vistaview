import type { VistaImageParams } from './types';
// import type { VistaHiresTransitionOpt } from './vista-hires-transition';
// import type { VistaImageState } from './types';

import { getFullSizeDim } from './utils/get-full-size-dim';
import { VistaHiresTransition } from './vista-hires-transition';
// import { getFittedSize } from './utils/get-fitted-size';
// import { VistaImageEvent } from './vista-image-event';
import { VistaBox } from './vista-box';

export class VistaImage extends VistaBox {
  element: HTMLImageElement;
  private rect: DOMRect | null = null;

  protected onWidthChange(value: number): void {
    super.onWidthChange(value);

    // update src from parsedSrcSet if available
    const url = this.getFromParsedSrcSet(value);
    if (url && this.element!.src !== url) {
      // create new image element and replace existing
      const newImg = new Image();
      newImg.onload = () => {
        newImg.decode().then(() => {
          if (this.isCancelled) return;
          this.element!.src = url;
        });
      };
      newImg.src = url;
    }
  }

  constructor(par: VistaImageParams) {
    super(par);

    const img = document.createElement('img');
    img.alt = this.config.alt || '';

    // adding srcset actually makes the load time longer for me
    // img.srcset = this.config.srcSet || '';
    img.classList.add('vvw-img-hi');
    this.element = img;

    img.onerror = (e) => {
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
        this.isLoadedRejected!(e);
      });

    // trigger setSizes to setup thumb and hires image
    // stableSize = false
    // initDimension = true
    this.setSizes({
      stableSize: false,
      initDimension: true,
    });
  }

  private onLoad() {
    if (this.isCancelled) return;

    const img = this.element! as HTMLImageElement;

    img.width = img.naturalWidth;
    img.height = img.naturalHeight;

    // set max zoomed dimensions
    // this.maxH = img.naturalHeight * this.maxZoomLevel;
    this.maxW = img.naturalWidth * this.maxZoomLevel;

    // set fullscreen dimensions
    const { width: fullWidth, height: fullHeight } = getFullSizeDim(img);
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5;
    // this.minH = this.fullH * 0.3

    this.isLoadedResolved!(true);
  }

  protected getFullSizeDim(): { width: number; height: number } {
    return getFullSizeDim(this.element!);
  }

  protected normalize() {
    super.normalize();
    const img = this.element!;
    img.style.objectFit = 'cover';
    img.style.borderRadius = '0';
  }

  // Used by: VistaImageEvent
  scaleMove(scaleFactor: number, center?: { x: number; y: number }, animate: boolean = false) {
    if (!this.isReady) return;
    if (!this.element) return;

    if (!this.rect) {
      this.rect = this.element.getBoundingClientRect();
    }

    if (!center) {
      center = this.initPointerCenter;
    }

    // Calculate translation to keep the INITIAL center point fixed during zoom
    // Current image center position
    const imgCenterX = this.rect.left + this.rect.width / 2;
    const imgCenterY = this.rect.top + this.rect.height / 2;

    // Distance from INITIAL pinch center to image center (when gesture started)
    const initialOffsetX = this.initPointerCenter.x - imgCenterX;
    const initialOffsetY = this.initPointerCenter.y - imgCenterY;

    // Zoom translation: keep initial pinch point fixed
    const zoomTranslateX = initialOffsetX * (1 - scaleFactor);
    const zoomTranslateY = initialOffsetY * (1 - scaleFactor);

    // Pan translation: account for finger movement during pinch
    const panX = center.x - this.initPointerCenter.x;
    const panY = center.y - this.initPointerCenter.y;

    if (animate) {
      VistaHiresTransition.start({
        vistaImage: this,
        target: {
          transform: {
            x: zoomTranslateX + panX,
            y: zoomTranslateY + panY,
            scale: scaleFactor,
          },
        },
        onComplete: () => {
          this.setFinalTransform();
        },
        shouldWait: () => false,
      });
    } else {
      this.state.transform = {
        x: zoomTranslateX + panX,
        y: zoomTranslateY + panY,
        scale: scaleFactor,
      };
    }

    // notify scale change
    const rect = this.element!.getBoundingClientRect();
    const scaledWidth = rect.width * scaleFactor;
    this.isZoomedIn = scaledWidth > this.fullW;
    this.state.lessThanMinWidth = scaledWidth <= this.minW;
    this.onScale({
      vistaImage: this,
      scale: scaledWidth / this.fullW,
      isMax: scaledWidth >= this.maxW,
      isMin: scaledWidth <= this.fullW,
    });
  }

  animateZoom(scaleFactor: number, center?: { x: number; y: number }) {
    if (this.state.width * scaleFactor < this.minW) return;
    this.scaleMove(scaleFactor, center, true);
  }

  // Used by: VistaImageEvent
  momentumThrow(par: { x: number; y: number }) {
    if (!this.isReady) {
      return () => {};
    }

    if (!this.isThrowing) {
      this.setFinalTransform();
      return () => {};
    }

    if (Math.abs(par.x) < 0.1 && Math.abs(par.y) < 0.1) {
      const img = this.element!;
      const bound = img.getBoundingClientRect();
      VistaHiresTransition.start({
        vistaImage: this,
        target: {
          transform: {
            x:
              bound.right < window.innerWidth / 2
                ? this.state.transform.x + (window.innerWidth / 2 - bound.right)
                : bound.left > window.innerWidth / 2
                  ? this.state.transform.x - (bound.left - window.innerWidth / 2)
                  : this.state.transform.x,
            y:
              bound.bottom < window.innerHeight / 2
                ? this.state.transform.y + (window.innerHeight / 2 - bound.bottom)
                : bound.top > window.innerHeight / 2
                  ? this.state.transform.y - (bound.top - window.innerHeight / 2)
                  : this.state.transform.y,
          },
        },
        onComplete: () => {
          this.isThrowing = false;
          this.setFinalTransform();
        },
        shouldWait: () => false,
      });

      return () => {};
    }

    requestAnimationFrame(() => {
      if (!this.isThrowing) return this.momentumThrow({ x: 0, y: 0 });

      const img = this.element!;
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
        x: par.x * 0.9,
        y: par.y * 0.9,
      });
    });

    return () => {
      VistaHiresTransition.stop(this);
      this.isThrowing = false;
      this.setFinalTransform();
    };
  }

  private animateNormalizeTimeout: number | null = null;
  private animateNormalize() {
    if (this.animateNormalizeTimeout) {
      clearTimeout(this.animateNormalizeTimeout);
    }
    this.animateNormalizeTimeout = setTimeout(() => {
      VistaHiresTransition.start({
        vistaImage: this,
        target: {
          width: this.fullW,
          height: this.fullH,
          translate: { x: 0, y: 0 },
          transform: { x: 0, y: 0, scale: 1 },
        },
        onComplete: () => {
          this.setFinalTransform();
        },
        shouldWait: () => false,
      });
    }, 50);
  }

  // Used by: VistaImageEvent
  setFinalTransform() {
    if (!this.isReady) return;

    // remove this.rect
    this.rect = null;

    super.setFinalTransform({ propagateEvent: false });

    const close = this.state.width <= this.minW;

    // animate back to max if over max
    if (this.state.width > this.maxW) {
      this.animateZoom(this.maxW / this.state.width);
    }

    // animate back to full if under full
    else if (!close && this.state.width < this.fullW) {
      this.animateNormalize();
    }

    // need to propagate content change event
    else if (this.pos === 0) {
      const obj = this.toObject();
      this.vistaView.options.onContentChange &&
        this.vistaView.options.onContentChange(obj, this.vistaView);
      this.vistaView.state.extensions.forEach((ext) => {
        ext.onContentChange && ext.onContentChange(obj, this.vistaView);
      });
    }

    // determine if this should be closed
    return {
      close,
      cancel: () => VistaHiresTransition.stop(this),
    };
  }
}
