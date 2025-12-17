import { clamp, limitPrecision } from './utils';

export type VistaCurrImg = {};

export class VistaImageState {
  private maxZoomLevel: number;
  private image: HTMLImageElement | null = null;
  private rect: DOMRect | null = null;
  private initialZoom: number = 1;
  private initialCenter: { x: number; y: number } = { x: 0, y: 0 };
  private maxDimension = { width: 0, height: 0 };
  private minDimension = { width: 0, height: 0 };

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
    const minDim = image.dataset.vvwMinDim;
    this.maxDimension = {
      width: image.naturalWidth * this.maxZoomLevel,
      height: image.naturalHeight * this.maxZoomLevel,
    };
    this.minDimension = minDim
      ? JSON.parse(minDim)
      : {
          width: this.rect.width,
          height: this.rect.height,
        };
    image.dataset.vvwMinDim = JSON.stringify(this.minDimension);
  }

  setInitialCenter(center: { x: number; y: number }) {
    this.initialCenter = center;
  }

  getInitialCenter() {
    return this.initialCenter;
  }

  scaleMove(pixelDistance: number, _center: { x: number; y: number }) {
    if (!this.image || !this.rect) return;

    const newWidth = clamp(
      this.rect.width + pixelDistance,
      this.minDimension.width,
      this.maxDimension.width
    );
    this.scale = limitPrecision(newWidth / this.rect.width);

    // Apply transform
    this.image.style.transform = `translate3d(${this.translate.x}px, ${this.translate.y}px, 0px) scale(${this.scale})`;
  }

  normalize() {
    if (!this.image || !this.rect) return;

    // translate scale to width/height
    this.image.style.width = `${this.rect.width * this.scale}px`;
    this.image.style.height = `${this.rect.height * this.scale}px`;

    this.rect = this.image.getBoundingClientRect();

    // remove transform
    this.image.style.transform = ``;
  }

  public getCurrentZoom(): number {
    return this.initialZoom;
  }
}
