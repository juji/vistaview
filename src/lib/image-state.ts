import type { VistaPointer } from './types';
import { clamp, limitPrecision } from './utils';

export type VistaImageStateScaleParams = {
  scale: number;
  isMax: boolean;
  isMin: boolean;
};

export class VistaImageState {
  private maxZoomLevel: number;
  private image: HTMLImageElement | null = null;
  private rect: DOMRect | null = null;
  private initialCenter: { x: number; y: number } = { x: 0, y: 0 };
  private maxDimension = { width: 0 };
  private minDimension = { initialWidth: 0, initialHeight: 0, minWidth: 0, closingWidth: 0 };
  private accumulatedTranslate = { x: 0, y: 0 };

  // state
  private scale: number = 1;
  private translate = { x: 0, y: 0 };
  private onScale: ((par: VistaImageStateScaleParams) => void) | null = null;

  constructor(maxZoomLevel: number, onScale: (par: VistaImageStateScaleParams) => void) {
    this.maxZoomLevel = maxZoomLevel;
    this.onScale = onScale;
  }

  clean() {
    if (!this.image) return;
    this.image.style.transform = ``;
    this.image.style.width = ``;
    this.image.style.height = ``;
    this.image.style.top = ``;
    this.image.style.left = ``;
    this.image.style.opacity = ``;
  }

  reset() {
    this.clean();
    this.image = null;
    this.rect = null;
    this.initialCenter = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.maxDimension = { width: 0 };
    this.minDimension = { initialWidth: 0, initialHeight: 0, minWidth: 0, closingWidth: 0 };
    this.accumulatedTranslate = { x: 0, y: 0 };
    this.scale = 1;
    this.translate = { x: 0, y: 0 };
  }

  setCurrentImage(image: HTMLImageElement) {
    this.rect = null;
    this.image = image;
    this.maxDimension = {
      width: image.naturalWidth * this.maxZoomLevel,
    };

    if (!image.dataset.vvwWidth || !image.dataset.vvwHeight) {
      throw new Error('VistaImageState: Image dataset vvwWidth or vvwHeight not set.');
    }

    const width = parseFloat(image.dataset.vvwWidth);
    const height = parseFloat(image.dataset.vvwHeight);
    this.minDimension = {
      initialWidth: width,
      initialHeight: height,
      minWidth: width * 0.1,
      closingWidth: width * 0.5,
    };
    this.accumulatedTranslate = { x: 0, y: 0 };
  }

  setInitialCenter(center?: { x: number; y: number }) {
    this.initialCenter = center || { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  }

  move(center: { x: number; y: number }) {
    if (!this.image) return;

    if (!this.rect) {
      this.rect = this.image.getBoundingClientRect();
    }

    this.translate.x = limitPrecision(center.x - this.initialCenter.x);
    this.translate.y = limitPrecision(center.y - this.initialCenter.y);

    // Apply transform
    this.image.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;
  }

  scaleMove(ratio: number, center?: { x: number; y: number }) {
    if (!this.image) return;

    if (!this.rect) {
      this.rect = this.image.getBoundingClientRect();
    }

    if (!center) {
      center = this.initialCenter;
    }

    const newWidth = clamp(
      this.rect.width * ratio,
      this.minDimension.minWidth,
      this.maxDimension.width
    );

    this.onScale &&
      this.onScale({
        scale: newWidth / (this.maxDimension.width / this.maxZoomLevel),
        isMax: newWidth >= this.maxDimension.width,
        isMin: newWidth <= this.minDimension.initialWidth,
      });

    this.scale = limitPrecision(newWidth / this.rect.width);

    // Calculate translation to keep the INITIAL center point fixed during zoom
    // Current image center position
    const imgCenterX = this.rect.left + this.rect.width / 2;
    const imgCenterY = this.rect.top + this.rect.height / 2;

    // Distance from INITIAL pinch center to image center (when gesture started)
    const initialOffsetX = this.initialCenter.x - imgCenterX;
    const initialOffsetY = this.initialCenter.y - imgCenterY;

    // Zoom translation: keep initial pinch point fixed
    const zoomTranslateX = initialOffsetX * (1 - this.scale);
    const zoomTranslateY = initialOffsetY * (1 - this.scale);

    // Pan translation: account for finger movement during pinch
    const panX = center.x - this.initialCenter.x;
    const panY = center.y - this.initialCenter.y;

    // Combine zoom translation and pan translation

    this.translate.x = limitPrecision(zoomTranslateX + panX);
    this.translate.y = limitPrecision(zoomTranslateY + panY);

    // console.log({
    //   newWidth,
    //   scale: this.scale,
    //   translate: this.translate,
    //   imgCenterX,
    //   imgCenterY,
    //   initialOffsetX,
    //   initialOffsetY,
    //   zoomTranslateX,
    //   zoomTranslateY,
    //   panX,
    //   panY,
    // });

    // Apply transform
    this.image.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;

    // change opacity if closing
    if (newWidth <= this.minDimension.closingWidth) {
      this.image.style.opacity = '0.5';
    } else {
      this.image.style.opacity = '';
    }
  }

  moveAndNormalize(pointer: VistaPointer): () => void {
    let raf = 0;
    let canceled = false;
    const animate = ({ x, y }: { x: number; y: number }) => {
      if (canceled) {
        return;
      }

      if (Math.abs(x) < 0.001 && Math.abs(y) < 0.001) {
        return this.normalize();
      }

      x *= 0.9;
      y *= 0.9;
      const bound = this.image!.getBoundingClientRect();

      this.translate.x = limitPrecision(this.translate.x + x);
      this.translate.y = limitPrecision(this.translate.y + y);

      if (bound.right < window.innerWidth / 2) {
        this.translate.x += (window.innerWidth / 2 - bound.right) * 0.1;
        x *= 0.7;
      }
      if (bound.left > window.innerWidth / 2) {
        this.translate.x -= (bound.left - window.innerWidth / 2) * 0.1;
        x *= 0.7;
      }
      if (bound.bottom < window.innerHeight / 2) {
        this.translate.y += (window.innerHeight / 2 - bound.bottom) * 0.1;
        y *= 0.7;
      }
      if (bound.top > window.innerHeight / 2) {
        this.translate.y -= (bound.top - window.innerHeight / 2) * 0.1;
        y *= 0.7;
      }

      this.image!.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;

      raf = requestAnimationFrame(() => animate({ x, y }));
    };

    animate({
      x: pointer.movementX,
      y: pointer.movementY,
    });

    return () => {
      console.log('canceled');
      canceled = true;
      cancelAnimationFrame(raf);
      this.normalize(false);
    };
  }

  private animationTimestamp: number = 0;
  animateZoom(targetScale: number) {
    if (!this.image) return;
    if (!this.rect) {
      this.rect = this.image.getBoundingClientRect();
    }

    const now = Date.now();
    const img = this.image;

    // prevent zooming out too much
    const newWidth = this.rect.width * targetScale;
    if (newWidth < this.minDimension.closingWidth) return;
    if (img.width < Math.floor(this.minDimension.initialWidth)) return; // seems to prevent jankyness

    img.addEventListener(
      'transitionend',
      () => {
        if (this.animationTimestamp !== now) return;
        if (!img) return;
        img.style.transition = '';
        this.normalize();
      },
      { once: true }
    );

    if (!img.style.transition) img.style.transition = 'all 222ms ease';

    this.animationTimestamp = now;
    this.scaleMove(targetScale);
  }

  normalize(checkBound: boolean = true): boolean | void {
    if (!this.image || !this.rect) return;

    // translate scale to width/height
    let newWidth = this.rect.width * this.scale;
    let newHeight = this.rect.height * this.scale;
    if (Math.round(newWidth) === Math.round(this.minDimension.initialWidth)) {
      newWidth = this.minDimension.initialWidth;
      newHeight = this.minDimension.initialHeight;
    }
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = `${newHeight}px`;
    this.scale = 1;

    // make sure opacity is back to normal
    this.image.style.opacity = '';

    // accumulate translate
    this.accumulatedTranslate.x += this.translate.x;
    this.accumulatedTranslate.y += this.translate.y;
    this.image.style.left = `calc(50% + ${this.accumulatedTranslate.x}px)`;
    this.image.style.top = `calc(50% + ${this.accumulatedTranslate.y}px)`;
    this.translate = { x: 0, y: 0 };

    // remove transform
    this.image.style.transform = ``;

    // update rect
    this.rect = this.image.getBoundingClientRect();

    if (newWidth <= this.minDimension.closingWidth) {
      // close image
      this.clean();
      return true;
    } else if (newWidth < this.minDimension.initialWidth) {
      // animate back to initial size
      this.accumulatedTranslate.x = 0;
      this.accumulatedTranslate.y = 0;
      requestAnimationFrame(() => {
        const img = this.image;
        if (!img) return;
        img.addEventListener(
          'transitionend',
          () => {
            if (!img) return;
            this.clean();
            this.rect = null;
          },
          { once: true }
        );
        img.style.transition = 'all 222ms ease';
        img.style.width = `${this.minDimension.initialWidth}px`;
        img.style.height = `${this.minDimension.initialHeight}px`;
        img.style.left = `50%`;
        img.style.top = `50%`;
      });
    } else if (checkBound) {
      let changes = false;

      // adjust position
      if (this.rect.right < window.innerWidth / 2) {
        changes = true;
        this.accumulatedTranslate.x += window.innerWidth / 2 - this.rect.right;
      }

      if (this.rect.left > window.innerWidth / 2) {
        changes = true;
        this.accumulatedTranslate.x -= this.rect.left - window.innerWidth / 2;
      }

      if (this.rect.bottom < window.innerHeight / 2) {
        changes = true;
        this.accumulatedTranslate.y += window.innerHeight / 2 - this.rect.bottom;
      }

      if (this.rect.top > window.innerHeight / 2) {
        changes = true;
        this.accumulatedTranslate.y -= this.rect.top - window.innerHeight / 2;
      }

      if (changes) {
        console.log('normalizing with bound changes');
        const img = this.image;
        img.addEventListener(
          'transitionend',
          () => {
            if (!img) return;
            img.style.transition = '';
            this.rect = null;
          },
          { once: true }
        );
        img.style.transition = 'all 222ms ease';
        img.style.left = `calc(50% + ${this.accumulatedTranslate.x}px)`;
        img.style.top = `calc(50% + ${this.accumulatedTranslate.y}px)`;
      } else {
        this.rect = null;
      }
    }
  }
}
