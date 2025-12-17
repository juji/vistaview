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

  close() {
    if (!this.image) return;
    this.image.style.transform = ``;
    this.image.style.width = ``;
    this.image.style.height = ``;
    this.image.style.top = ``;
    this.image.style.left = ``;
    this.image.style.opacity = ``;
  }

  reset() {
    this.close();
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
    this.rect = image.getBoundingClientRect();
    this.image = image;
    this.maxDimension = {
      width: image.naturalWidth * this.maxZoomLevel,
    };

    if (!image.dataset.vvwWidth || !image.dataset.vvwHeight) {
      throw new Error('VistaImageState: Image dataset vvwWidth or vvwHeight not set.');
    }

    if (!this.rect.width) {
      console.error('Error', image);
      throw new Error('VistaImageState: Image rect width is zero.');
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

  setInitialCenter(center: { x: number; y: number }) {
    this.initialCenter = center;
  }

  move(center: { x: number; y: number }) {
    if (!this.image || !this.rect) return;

    this.translate.x = limitPrecision(center.x - this.initialCenter.x);
    this.translate.y = limitPrecision(center.y - this.initialCenter.y);

    // Apply transform
    this.image.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;
  }

  scaleMove(ratio: number, center?: { x: number; y: number }) {
    if (!this.image || !this.rect || !this.rect.width) return;

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

    // Apply transform
    this.image.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;

    // change opacity if closing
    if (newWidth <= this.minDimension.closingWidth) {
      this.image.style.opacity = '0.5';
    } else {
      this.image.style.opacity = '1';
    }
  }

  moveAndNormalize(pointer: VistaPointer) {
    if (pointer.deltaTime > 333) {
      this.normalize();
      return () => {};
    }

    let raf = 0;
    const animate = ({ x, y }: { x: number; y: number }) => {
      this.translate.x = limitPrecision(this.translate.x + x);
      this.translate.y = limitPrecision(this.translate.y + y);
      this.image!.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;

      if (Math.abs(x) < 0.1 && Math.abs(y) < 0.1) return this.normalize();

      const speedFactor = 0.95;
      raf = requestAnimationFrame(() =>
        animate({
          x: x * speedFactor,
          y: y * speedFactor,
        })
      );
    };

    console.log('moveAndNormalize', pointer.velocityX, pointer.velocityY);
    raf = requestAnimationFrame(() =>
      animate({
        x: pointer.velocityX * 33,
        y: pointer.velocityY * 33,
      })
    );

    return () => {
      cancelAnimationFrame(raf);
      this.normalize();
    };
  }

  normalize(): boolean | void {
    if (!this.image || !this.rect) return;

    // translate scale to width/height
    const newWidth = this.rect.width * this.scale;
    const newHeight = this.rect.height * this.scale;
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = `${newHeight}px`;
    this.scale = 1;

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
      this.image.style.opacity = '';
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
            img.style.transition = '';
            this.rect = img.getBoundingClientRect();
          },
          { once: true }
        );
        img.style.transition = 'all 222ms ease';
        img.style.width = `${this.minDimension.initialWidth}px`;
        img.style.height = `${this.minDimension.initialHeight}px`;
        img.style.left = `50%`;
        img.style.top = `50%`;
      });
    }
  }
}
