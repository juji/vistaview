import { vistaViewComponent, getDownloadButton } from './components';
import {
  createTrustedHtml,
  getElmProperties,
  getFittedSize,
  isNotZeroCssValue,
  makeFullScreenContain,
  getMaxMinZoomLevels,
} from './utils';

export type VistaViewElm = {
  objectFit?: string;
  borderRadius?: string;
  objectPosition?: string;
  overflow?: string;
};

export type VistaViewImage = {
  src: string;
  width: number;
  height: number;
  alt?: string;
  smallSrc?: string;
  anchor?: HTMLAnchorElement;
  image?: HTMLImageElement;
  onClick?: (e: Event) => void;
};

export type VistaViewOptions = {
  animationDurationBase?: number;
  initialZIndex?: number;
  detectReducedMotion?: boolean;
  zoomStep?: number;
  maxZoomLevel?: number;
  controls?: {
    topLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
  };
};

export type VistaViewDefaultControls = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'download' | 'close';
export type VistaViewCustomControl = {
  name: string;
  icon: string;
  onClick: (v: VistaViewImage) => void;
};

const GlobalVistaState = {
  somethingOpened: false,
};

export const DefaultOptions = {
  detectReducedMotion: true,
  zoomStep: 500,
  maxZoomLevel: 2,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', getDownloadButton(), 'close'],
  } as VistaViewOptions['controls'],
};

export class VistaView {
  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  private rootElement: HTMLElement | null = null;
  private containerElement: HTMLElement | null = null;
  private isActive: boolean = false;
  private isZoomed: number | boolean = false;

  private options: VistaViewOptions;
  private indexDisplayElement: HTMLElement | null = null;
  private isReducedMotion: boolean;

  private setInitialProperties: (() => void) | null = null;
  private setFullScreenContain: (() => void) | null = null;
  private onZoomedPointerDown: ((e: PointerEvent) => void) | null = null;
  private onZoomedPointerMove: ((e: PointerEvent) => void) | null = null;
  private onZoomedPointerUp: ((e: PointerEvent) => void) | null = null;

  constructor(elements: VistaViewImage[], options?: VistaViewOptions) {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.elements = elements;
    this.options = {
      ...DefaultOptions,
      ...(options || {}),
      controls: {
        ...DefaultOptions.controls,
        ...(options?.controls || {}),
      },
    };

    this.elements.forEach((el, index) => {
      const clickable = el.anchor || el.image;
      if (clickable) {
        el.onClick = (e) => {
          e.preventDefault();
          this.open(index);
        };
        clickable.addEventListener('click', el.onClick);
      }
    });
  }

  private setZoomed(index: number | false): void {
    if (this.isZoomed === index) return;

    //
    let image =
      this.isZoomed !== false
        ? (this.containerElement?.querySelectorAll('.vistaview-image-highres')[
            this.isZoomed as number
          ] as HTMLImageElement)
        : null;

    this.isZoomed = index;

    if (this.isZoomed === false && image) {
      if (this.onZoomedPointerDown) {
        image.parentElement?.removeEventListener('pointerdown', this.onZoomedPointerDown!);
        this.onZoomedPointerDown = null;
      }
      if (this.onZoomedPointerMove) {
        image.parentElement?.removeEventListener('pointermove', this.onZoomedPointerMove!);
        this.onZoomedPointerMove = null;
      }
      if (this.onZoomedPointerUp) {
        image.parentElement?.removeEventListener('pointerup', this.onZoomedPointerUp!);
        this.onZoomedPointerUp = null;
      }
      image?.style.removeProperty('--pointer-diff-x');
      image?.style.removeProperty('--pointer-diff-y');
      setTimeout(() => {
        image?.classList.remove('vistaview-image--zooming');
      }, 500);
      return;
    }

    if (this.isZoomed !== false) {
      image = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
        this.isZoomed as number
      ] as HTMLImageElement;

      image.classList.add('vistaview-image--zooming');

      image?.style.setProperty('--pointer-diff-x', `0px`);
      image?.style.setProperty('--pointer-diff-y', `0px`);

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let diffX = 0;
      let diffY = 0;
      let localDiffX = 0;
      let localDiffY = 0;

      if (this.onZoomedPointerDown) {
        image.parentElement?.removeEventListener('pointerdown', this.onZoomedPointerDown!);
        this.onZoomedPointerDown = null;
      }
      if (this.onZoomedPointerMove) {
        image.parentElement?.removeEventListener('pointermove', this.onZoomedPointerMove!);
        this.onZoomedPointerMove = null;
      }
      if (this.onZoomedPointerUp) {
        image.parentElement?.removeEventListener('pointerup', this.onZoomedPointerUp!);
        this.onZoomedPointerUp = null;
      }

      this.onZoomedPointerDown = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        image!.setPointerCapture(e.pointerId);
      };

      this.onZoomedPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        localDiffX = e.pageX - startX;
        localDiffY = e.pageY - startY;

        const imageWidth = parseInt(image?.dataset.vistaviewCurrentWidth || '0');
        const imageHeight = parseInt(image?.dataset.vistaviewCurrentHeight || '0');
        const { maxDiffX, minDiffY, maxDiffY, minDiffX } = getMaxMinZoomLevels(
          imageWidth,
          imageHeight
        );
        const pointerDiffX = Math.min(maxDiffX, Math.max(minDiffX, diffX + localDiffX));
        const pointerDiffY = Math.min(maxDiffY, Math.max(minDiffY, diffY + localDiffY));
        localDiffX = pointerDiffX - diffX;
        localDiffY = pointerDiffY - diffY;

        image?.style.setProperty('--pointer-diff-x', `${pointerDiffX}px`);
        image?.style.setProperty('--pointer-diff-y', `${pointerDiffY}px`);
      };

      this.onZoomedPointerUp = (e: PointerEvent) => {
        isDragging = false;
        image!.releasePointerCapture(e.pointerId);
        diffX += localDiffX;
        diffY += localDiffY;
        localDiffX = 0;
        localDiffY = 0;
      };

      image?.parentElement?.addEventListener('pointerdown', this.onZoomedPointerDown);
      image?.parentElement?.addEventListener('pointermove', this.onZoomedPointerMove);
      image?.parentElement?.addEventListener('pointerup', this.onZoomedPointerUp);
    }
  }

  private setIndexDisplay(): void {
    if (!this.indexDisplayElement) return;
    this.indexDisplayElement.textContent = `${this.currentIndex + 1} / ${this.elements.length}`;
  }

  private getAnimationDurationBase(): number {
    const style = window.getComputedStyle(this.rootElement!);
    return parseInt(style.getPropertyValue('--vistaview-animation-duration'));
  }

  private zoomIn(): void {
    const highresImage = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    const width = highresImage.width;
    const height = highresImage.height;

    if (!highresImage.dataset.vistaviewInitialWidth) {
      highresImage.dataset.vistaviewInitialWidth = width.toString();
    }
    if (!highresImage.dataset.vistaviewInitialHeight) {
      highresImage.dataset.vistaviewInitialHeight = height.toString();
    }

    this.setZoomed(this.currentIndex);

    const maxWidth = (highresImage.naturalWidth || 0) * this.options.maxZoomLevel!;

    if (width && maxWidth && width < maxWidth) {
      const newWidth = Math.min(width + this.options.zoomStep!, maxWidth);
      highresImage!.style.width = `${newWidth}px`;
      const newHeight = (newWidth / width) * height;
      highresImage!.style.height = `${newHeight}px`;
      this.containerElement
        ?.querySelector('button.vistaview-zoom-out-button')
        ?.removeAttribute('disabled');

      highresImage.dataset.vistaviewCurrentWidth = newWidth.toString();
      highresImage.dataset.vistaviewCurrentHeight = newHeight.toString();

      if (newWidth === maxWidth) {
        this.containerElement
          ?.querySelector('button.vistaview-zoom-in-button')
          ?.setAttribute('disabled', 'true');
      }
    }
  }

  private zoomOut(): void {
    const highresImage = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    const width = highresImage.width;
    const height = highresImage.height;

    const minWidth = highresImage.dataset.vistaviewInitialWidth
      ? parseInt(highresImage.dataset.vistaviewInitialWidth)
      : 0;

    if (width && minWidth && width > minWidth) {
      const newWidth = Math.max(width - this.options.zoomStep!, minWidth);
      highresImage!.style.width = `${newWidth}px`;

      const newHeight = (newWidth / width) * height;
      highresImage!.style.height = `${newHeight}px`;
      this.containerElement
        ?.querySelector('button.vistaview-zoom-in-button')
        ?.removeAttribute('disabled');
      highresImage.dataset.vistaviewCurrentWidth = newWidth.toString();
      highresImage.dataset.vistaviewCurrentHeight = newHeight.toString();

      // set counter zoom panning limits
      const { maxDiffX, minDiffY, maxDiffY, minDiffX } = getMaxMinZoomLevels(newWidth, newHeight);
      let pointerDiffX = parseInt(
        highresImage?.style.getPropertyValue('--pointer-diff-x').replace('px', '') || '0'
      );
      let pointerDiffY = parseInt(
        highresImage?.style.getPropertyValue('--pointer-diff-y').replace('px', '') || '0'
      );
      pointerDiffX = Math.min(maxDiffX, Math.max(minDiffX, pointerDiffX));
      pointerDiffY = Math.min(maxDiffY, Math.max(minDiffY, pointerDiffY));

      highresImage?.style.setProperty('--pointer-diff-x', `${pointerDiffX}px`);
      highresImage?.style.setProperty('--pointer-diff-y', `${pointerDiffY}px`);

      // when reached min zoom level
      if (newWidth === minWidth) {
        this.containerElement
          ?.querySelector('button.vistaview-zoom-out-button')
          ?.setAttribute('disabled', 'true');
        highresImage.removeAttribute('data-vistaview-current-width');
        highresImage.removeAttribute('data-vistaview-current-height');
        highresImage.removeAttribute('data-vistaview-initial-width');
        highresImage.removeAttribute('data-vistaview-initial-height');
        this.setZoomed(false);
      }
    }
  }

  private clearZoom(): void {
    const highresImage = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    if (highresImage.dataset.vistaviewInitialWidth) {
      highresImage.style.width = `${highresImage.dataset.vistaviewInitialWidth}px`;
    }
    if (highresImage.dataset.vistaviewInitialHeight) {
      highresImage.style.height = `${highresImage.dataset.vistaviewInitialHeight}px`;
    }
    this.containerElement
      ?.querySelector('button.vistaview-zoom-in-button')
      ?.removeAttribute('disabled');
    this.containerElement
      ?.querySelector('button.vistaview-zoom-out-button')
      ?.setAttribute('disabled', 'true');
    highresImage.removeAttribute('data-vistaview-current-width');
    highresImage.removeAttribute('data-vistaview-current-height');
    highresImage.removeAttribute('data-vistaview-initial-width');
    highresImage.removeAttribute('data-vistaview-initial-height');

    this.setZoomed(false);
  }

  private resetImageOpacity(turnOn = false): void {
    this.elements.forEach((el, i) => {
      if (!el.image?.dataset.vistaviewInitialOpacity) {
        el.image!.dataset.vistaviewInitialOpacity = el.image!.style.opacity || '1';
      }

      if (i === this.currentIndex && !turnOn) {
        el.image!.style.opacity = '0';
      } else {
        el.image!.style.opacity = el.image!.dataset.vistaviewInitialOpacity;
      }
    });
  }

  open(index?: number): void {
    // prevent opening if other vistaview is already opened
    if (GlobalVistaState.somethingOpened) return;
    GlobalVistaState.somethingOpened = true;
    this.isActive = true;

    index = index || 0;

    if (index < 0 || index >= this.elements.length) {
      throw new Error('VistaView: Index out of bounds:' + index);
    }

    this.currentIndex = index;

    // prepend
    const component = vistaViewComponent(this.elements, this.options.controls!);
    document.body.prepend(createTrustedHtml(component));

    // set elements
    this.rootElement = document.querySelector('#vistaview-root');
    if (!this.rootElement) throw new Error('VistaView: Failed to create root element.');
    if (this.options.detectReducedMotion && this.isReducedMotion) {
      this.rootElement.classList.add('vistaview--reduced-motion');
    }

    this.containerElement = this.rootElement.querySelector('.vistaview-container');
    if (!this.containerElement) throw new Error('VistaView: Failed to create container element.');
    this.indexDisplayElement = this.containerElement.querySelector('.vistaview-index-display');

    // add options
    if (this.options.animationDurationBase) {
      this.rootElement.style.setProperty(
        '--vistaview-animation-duration',
        `${this.options.animationDurationBase}ms`
      );
    }

    if (this.options.initialZIndex !== undefined) {
      this.rootElement.style.setProperty(
        '--vistaview-initial-z-index',
        `${this.options.initialZIndex}`
      );
    }

    // add vars
    const imageProps = this.elements[index].image
      ? getElmProperties(this.elements[index].image as HTMLImageElement)
      : undefined;
    const anchorProps = this.elements[index].anchor
      ? getElmProperties(this.elements[index].anchor as HTMLAnchorElement)
      : undefined;
    const elm = this.elements[index].anchor
      ? this.elements[index].anchor
      : this.elements[index].image;
    if (!elm) throw new Error('VistaView: Failed to get element.');
    const pos = elm.getBoundingClientRect();

    this.rootElement.style.setProperty('--vistaview-container-initial-width', `${pos?.width}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-height', `${pos?.height}px`);
    this.rootElement.style.setProperty(
      '--vistaview-container-initial-top',
      `${pos.top + pos.height / 2}px`
    );
    this.rootElement.style.setProperty(
      '--vistaview-container-initial-left',
      `${pos.left + pos.width / 2}px`
    );
    this.rootElement.style.setProperty('--vistaview-number-elements', `${this.elements.length}`);
    this.rootElement.style.setProperty(
      '--vistaview-image-border-radius',
      isNotZeroCssValue(imageProps?.borderRadius) ||
        isNotZeroCssValue(anchorProps?.borderRadius) ||
        '0px'
    );

    // set properties on window resize
    this.setInitialProperties = () => {
      if (!this.isActive) return;
      const elm = this.elements[this.currentIndex].anchor
        ? this.elements[this.currentIndex].anchor
        : this.elements[this.currentIndex].image;
      if (!elm) return;
      const pos = elm.getBoundingClientRect();
      this.rootElement?.style.setProperty('--vistaview-container-initial-width', `${pos?.width}px`);
      this.rootElement?.style.setProperty(
        '--vistaview-container-initial-height',
        `${pos?.height}px`
      );
      this.rootElement?.style.setProperty(
        '--vistaview-container-initial-top',
        `${pos.top + pos.height / 2}px`
      );
      this.rootElement?.style.setProperty(
        '--vistaview-container-initial-left',
        `${pos.left + pos.width / 2}px`
      );
    };
    window.addEventListener('resize', this.setInitialProperties);

    // get all custom controls
    const allCustomControls = [
      ...(this.options.controls!.topLeft || []),
      ...(this.options.controls!.topCenter || []),
      ...(this.options.controls!.topRight || []),
      ...(this.options.controls!.bottomLeft || []),
      ...(this.options.controls!.bottomCenter || []),
      ...(this.options.controls!.bottomRight || []),
    ].filter((c) => typeof c !== 'string') as VistaViewCustomControl[];

    // set buttons listeners
    this.containerElement.querySelectorAll('button').forEach((button) => {
      const customControlName = button.getAttribute('data-vistaview-custom-control');
      if (customControlName) {
        const control = allCustomControls.find((c) => c.name === customControlName) as
          | VistaViewCustomControl
          | undefined;
        if (control) {
          button.addEventListener('click', () => {
            control.onClick(this.elements[this.currentIndex]);
          });
        }
      } else {
        // default control
        if (button.classList.contains('vistaview-zoom-in-button')) {
          button.addEventListener('click', () => {
            this.zoomIn();
          });
        } else if (button.classList.contains('vistaview-zoom-out-button')) {
          button.addEventListener('click', () => {
            this.zoomOut();
          });
        } else if (button.classList.contains('vistaview-close-button')) {
          button.addEventListener('click', () => {
            this.close();
          });
        } else if (button.parentElement?.classList.contains('vistaview-prev-btn')) {
          button.addEventListener('click', () => {
            this.prev();
          });
        } else if (button.parentElement?.classList.contains('vistaview-next-btn')) {
          button.addEventListener('click', () => {
            this.next();
          });
        }
      }
    });

    // set current index display
    this.setIndexDisplay();

    // set current index css var
    this.rootElement?.style.setProperty('--vistaview-current-index', `${this.currentIndex}`);

    const highresImages = this.containerElement.querySelectorAll('.vistaview-image-highres');
    highresImages.forEach((img, i) => {
      const im = img as HTMLImageElement;

      // set large image initial dimensions
      const el = this.elements[i];
      const thumb = el.image;
      if (!thumb) return;
      const { width, height } = getFittedSize(thumb as HTMLImageElement);
      im.style.width = `${Math.min(width, thumb.width)}px;`;
      im.style.height = `${Math.min(height, thumb.height)}px;`;

      // on loaded
      if (im.complete) {
        im.classList.add('vistaview-image-loaded');
        im.parentElement
          ?.querySelector('.vistaview-image-lowres')
          ?.classList.add('vistaview-image--hidden');
        makeFullScreenContain(im);
      } else {
        im.onload = () => {
          im.classList.add('vistaview-image-loaded');
          im.parentElement
            ?.querySelector('.vistaview-image-lowres')
            ?.classList.add('vistaview-image--hidden');
          makeFullScreenContain(im);
        };
      }
    });

    // resize listener for fullscreen contain
    this.setFullScreenContain = () => {
      if (!this.isActive) return;
      const highresImages = this.containerElement?.querySelectorAll('.vistaview-image-highres');
      highresImages?.forEach((img) => {
        const im = img as HTMLImageElement;
        makeFullScreenContain(im, im.classList.contains('vistaview-image--zooming'));
      });
    };

    window.addEventListener('resize', this.setFullScreenContain);

    // set as initialized
    setTimeout(() => {
      this.rootElement && this.rootElement.classList.add('vistaview--initialized');
      this.resetImageOpacity();
    }, 33);

    //
  }

  async close(animate = true): Promise<void> {
    if (!this.isActive) return;
    this.isActive = false;

    if (animate) {
      // get animation duration base from css
      const animationDurationBase = this.getAnimationDurationBase();

      // wait for animation
      this.rootElement?.classList.add('vistaview--closing');
      if (!(this.options.detectReducedMotion && this.isReducedMotion)) {
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve(true);
          }, animationDurationBase * 1.5);
        });
      }
    }

    // Remove the root element
    this.rootElement?.remove();
    this.rootElement = null;
    this.containerElement = null;
    this.resetImageOpacity(true);
    this.setInitialProperties && window.removeEventListener('resize', this.setInitialProperties);
    this.setFullScreenContain && window.removeEventListener('resize', this.setFullScreenContain);
    GlobalVistaState.somethingOpened = false;
  }

  destroy(): void {
    if (!this.isActive) return;
    this.close(false);
    this.elements.forEach((el) => {
      const clickable = el.anchor || el.image;
      if (clickable && el.onClick) {
        clickable.removeEventListener('click', el.onClick);
      }
    });
  }

  view(index: number): void {
    if (!this.isActive) return;
    if (index < 0 || index >= this.elements.length) {
      throw new Error('VistaView: Index out of bounds:' + index);
    }
    this.clearZoom();
    this.currentIndex = index;
    this.resetImageOpacity();
    this.setIndexDisplay();
    this.setInitialProperties && this.setInitialProperties();
    this.rootElement?.style.setProperty('--vistaview-current-index', `${this.currentIndex}`);
  }

  next(): void {
    if (!this.isActive) return;
    this.view((this.currentIndex + 1) % this.elements.length);
  }

  prev(): void {
    if (!this.isActive) return;
    this.view((this.currentIndex - 1 + this.elements.length) % this.elements.length);
  }

  getCurrentIndex(): number {
    return this.isActive ? this.currentIndex : -1;
  }
}
