import { clamp, limitPrecision } from './utils';

export type VistaCurrImg = {};

export class VistaImageState {
  private maxZoomLevel: number;
  private image: HTMLImageElement | null = null;
  private rect: DOMRect | null = null;
  private initialZoom: number = 1;
  private initialCenter: { x: number; y: number } = { x: 0, y: 0 };
  private maxDimension = { width: 0, height: 0 };
  private minDimension = { initialWidth: 0, initialHeight: 0, minWidth: 0, closingWidth: 0 };
  private accumulatedTranslate = { x: 0, y: 0 };

  // state
  private scale: number = 1;
  private translate = { x: 0, y: 0 };

  constructor(maxZoomLevel: number) {
    this.maxZoomLevel = maxZoomLevel;
  }

  setCurrentImage(image: HTMLImageElement) {
    this.rect = image.getBoundingClientRect();
    this.image = image;
    this.initialZoom = this.rect.width / image.naturalWidth;
    this.maxDimension = {
      width: image.naturalWidth * this.maxZoomLevel,
      height: image.naturalHeight * this.maxZoomLevel,
    };

    const minDim = image.dataset.vvwMinDim;
    this.minDimension = minDim
      ? JSON.parse(minDim)
      : {
          initialWidth: this.rect.width,
          initialHeight: this.rect.height,
          minWidth: this.rect.width * 0.3,
          closingWidth: this.rect.width * 0.5,
        };

    image.dataset.vvwMinDim = JSON.stringify(this.minDimension);

    const accumTrans = image.dataset.vvwAccumTrans;
    this.accumulatedTranslate = accumTrans ? JSON.parse(accumTrans) : { x: 0, y: 0 };
    image.dataset.vvwAccumTrans = JSON.stringify(this.accumulatedTranslate);
  }

  setInitialCenter(center: { x: number; y: number }) {
    this.initialCenter = center;
  }

  getInitialCenter() {
    return this.initialCenter;
  }

  scaleMove(ratio: number, center: { x: number; y: number }) {
    if (!this.image || !this.rect) return;

    const newWidth = clamp(
      this.rect.width * ratio,
      this.minDimension.minWidth,
      this.maxDimension.width
    );
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

  normalize() {
    if (!this.image || !this.rect) return;

    // translate scale to width/height
    const newWidth = this.rect.width * this.scale;
    const newHeight = this.rect.height * this.scale;
    this.image.style.width = `${newWidth}px`;
    this.image.style.height = `${newHeight}px`;
    this.scale = 1;

    // accumulate translate
    const accumX = parseFloat(this.image.dataset.vvwAccumTranslateX || '0') + this.translate.x;
    const accumY = parseFloat(this.image.dataset.vvwAccumTranslateY || '0') + this.translate.y;
    this.image.dataset.vvwAccumTranslateX = accumX.toString();
    this.image.dataset.vvwAccumTranslateY = accumY.toString();
    this.image.style.left = `calc(50% + ${accumX}px)`;
    this.image.style.top = `calc(50% + ${accumY}px)`;
    this.translate = { x: 0, y: 0 };

    this.rect = this.image.getBoundingClientRect();

    // remove transform
    this.image.style.transform = ``;

    if (newWidth <= this.minDimension.closingWidth) {
      this.image.style.opacity = '';
      return true;
    } else if (newWidth < this.minDimension.initialWidth) {
      // animate back to initial size
      requestAnimationFrame(() => {
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

  public getCurrentZoom(): number {
    return this.initialZoom;
  }
}
