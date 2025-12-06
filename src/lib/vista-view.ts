import { vistaViewComponent, getDownloadButton } from './components';
import {
  createTrustedHtml,
  getElmProperties,
  getFittedSize,
  isNotZeroCssValue,
  makeFullScreenContain,
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
  zoomStep: 300,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', getDownloadButton(), 'close'],
  },
};

export class VistaView {
  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  private rootElement: HTMLElement | null = null;
  private containerElement: HTMLElement | null = null;
  private isActive: boolean = false;

  private options: VistaViewOptions;
  private indexDisplayElement: HTMLElement | null = null;
  private isReducedMotion: boolean;
  private detectReducedMotion: boolean = true;

  private setInitialProperties: (() => void) | null = null;
  private setFullScreenContain: (() => void) | null = null;

  constructor(elements: VistaViewImage[], options: VistaViewOptions) {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.detectReducedMotion =
      options.detectReducedMotion !== undefined
        ? options.detectReducedMotion
        : DefaultOptions.detectReducedMotion;

    this.elements = elements;
    this.options = options;

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

  private setIndexDisplay(): void {
    if (!this.indexDisplayElement) return;
    this.indexDisplayElement.textContent = `${this.currentIndex + 1} / ${this.elements.length}`;
  }

  private getAnimationDurationBase(): number {
    const style = window.getComputedStyle(this.rootElement!);
    return parseInt(style.getPropertyValue('--vistaview-animation-duration'));
  }

  private zoomIn(): void {
    const highresImages = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    const width = highresImages.width;
    const height = highresImages.height;

    if (!highresImages.dataset.vistaviewInitialWidth) {
      highresImages.dataset.vistaviewInitialWidth = width.toString();
    }
    if (!highresImages.dataset.vistaviewInitialHeight) {
      highresImages.dataset.vistaviewInitialHeight = height.toString();
    }

    highresImages?.classList.add('vistaview-image--zooming');
    const maxWidth = highresImages.naturalWidth || 0;

    if (width && maxWidth && width < maxWidth) {
      const newWidth = Math.min(
        width + (this.options.zoomStep || DefaultOptions.zoomStep),
        maxWidth
      );
      highresImages!.style.width = `${newWidth}px`;
      const newHeight = (newWidth / width) * height;
      highresImages!.style.height = `${newHeight}px`;
      this.containerElement
        ?.querySelector('button.vistaview-zoom-out-button')
        ?.removeAttribute('disabled');

      highresImages.dataset.vistaviewCurrentWidth = newWidth.toString();
      highresImages.dataset.vistaviewCurrentHeight = newHeight.toString();

      if (newWidth === maxWidth) {
        this.containerElement
          ?.querySelector('button.vistaview-zoom-in-button')
          ?.setAttribute('disabled', 'true');
      }
    }
  }

  private zoomOut(): void {
    const highresImages = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    const width = highresImages.width;
    const height = highresImages.height;

    const minWidth = highresImages.dataset.vistaviewInitialWidth
      ? parseInt(highresImages.dataset.vistaviewInitialWidth)
      : 0;

    if (width && minWidth && width > minWidth) {
      const newWidth = Math.max(
        width - (this.options.zoomStep || DefaultOptions.zoomStep),
        minWidth
      );
      highresImages!.style.width = `${newWidth}px`;
      const newHeight = (newWidth / width) * height;
      highresImages!.style.height = `${newHeight}px`;
      this.containerElement
        ?.querySelector('button.vistaview-zoom-in-button')
        ?.removeAttribute('disabled');
      highresImages.dataset.vistaviewCurrentWidth = newWidth.toString();
      highresImages.dataset.vistaviewCurrentHeight = newHeight.toString();

      if (newWidth === minWidth) {
        this.containerElement
          ?.querySelector('button.vistaview-zoom-out-button')
          ?.setAttribute('disabled', 'true');
        highresImages.removeAttribute('data-vistaview-current-width');
        highresImages.removeAttribute('data-vistaview-current-height');
        highresImages.removeAttribute('data-vistaview-initial-width');
        highresImages.removeAttribute('data-vistaview-initial-height');
        highresImages?.classList.remove('vistaview-image--zooming');
      }
    }
  }

  private clearZoom(): void {
    const highresImages = this.containerElement?.querySelectorAll('.vistaview-image-highres')[
      this.currentIndex
    ] as HTMLImageElement;
    if (highresImages.dataset.vistaviewInitialWidth) {
      highresImages.style.width = `${highresImages.dataset.vistaviewInitialWidth}px`;
    }
    if (highresImages.dataset.vistaviewInitialHeight) {
      highresImages.style.height = `${highresImages.dataset.vistaviewInitialHeight}px`;
    }
    this.containerElement
      ?.querySelector('button.vistaview-zoom-in-button')
      ?.removeAttribute('disabled');
    this.containerElement
      ?.querySelector('button.vistaview-zoom-out-button')
      ?.setAttribute('disabled', 'true');
    highresImages.removeAttribute('data-vistaview-current-width');
    highresImages.removeAttribute('data-vistaview-current-height');
    highresImages.removeAttribute('data-vistaview-initial-width');
    highresImages.removeAttribute('data-vistaview-initial-height');
    highresImages?.classList.remove('vistaview-image--zooming');
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
    const mergedControls = {
      ...DefaultOptions.controls,
      ...this.options.controls,
    };
    const component = vistaViewComponent(
      this.elements,
      mergedControls as VistaViewOptions['controls']
    );
    document.body.prepend(createTrustedHtml(component));

    // set elements
    this.rootElement = document.querySelector('#vistaview-root');
    if (!this.rootElement) throw new Error('VistaView: Failed to create root element.');
    if (this.detectReducedMotion && this.isReducedMotion) {
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
      ...(mergedControls.topLeft || []),
      ...(mergedControls.topCenter || []),
      ...(mergedControls.topRight || []),
      ...(mergedControls.bottomLeft || []),
      ...(mergedControls.bottomCenter || []),
      ...(mergedControls.bottomRight || []),
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
      if (!(this.detectReducedMotion && this.isReducedMotion)) {
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
