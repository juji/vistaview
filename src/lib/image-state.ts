import { clamp, limitPrecision } from './utils';

export type VistaCurrImg = {};

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

  constructor(maxZoomLevel: number) {
    this.maxZoomLevel = maxZoomLevel;
  }

  reset() {
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

  scaleMove(ratio: number, center?: { x: number; y: number }) {
    if (!this.image || !this.rect) return;

    if (!center) {
      center = this.initialCenter;
    }

    const newWidth = clamp(
      this.rect.width * ratio,
      this.minDimension.minWidth,
      this.maxDimension.width
    );

    this.scale = limitPrecision(newWidth / this.rect.width);
    // console.log('Scaling to', this.scale);

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

  normalize() {
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
      requestAnimationFrame(() => {
        console.log('Animating back to initial size');
        const img = this.image;
        if (!img) return;
        img.dataset.vvwAccumTranslateX = '0';
        img.dataset.vvwAccumTranslateY = '0';
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
