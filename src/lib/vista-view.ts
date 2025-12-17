import type {
  VistaCloseFn,
  VistaCustomCtrl,
  VistaImg,
  VistaImgIdx,
  VistaInitFn,
  VistaOpt,
  VistaSetupFn,
  VistaTransitionFn,
  VistaPointerListenerArgs,
  VistaExternalPointerListenerArgs,
} from './types';
import { DefaultOptions } from './defaults/options';
import { vistaViewComponent, vistaViewItem } from './components';

import { setup } from './defaults/setup';
import { init } from './defaults/init';
import { close } from './defaults/close';
import { transition } from './defaults/transition';
import { getFullSizeDim, setImageStyles } from './utils';
import { VistaPointers } from './pointers';
import { VistaImageState } from './image-state';
import { Throttle } from './throttle';

export const GlobalVistaState: { somethingOpened: VistaView | null } = {
  somethingOpened: null,
};

export class VistaView {
  options: VistaOpt;
  elements: NodeListOf<HTMLElement> | VistaImg[];
  isReducedMotion: boolean;

  private currentIndex: number = -1;
  private currentChildren: { htmls: HTMLDivElement[]; images: VistaImgIdx[] } | null = null;

  private setupFunction: VistaSetupFn = setup;
  private initFunction: VistaInitFn = init;
  private closeFunction: VistaCloseFn = close;
  private transitionFunction: VistaTransitionFn = transition;
  private pointers: VistaPointers | null = null;

  root: HTMLElement | null = null;
  imageContainer: HTMLElement | null = null;
  qs<T extends HTMLElement>(selector: string): T | null {
    return this.root ? (this.root.querySelector(selector) as T | null) : null;
  }

  private onClickElements: (e: PointerEvent) => void = (e) => {
    e.preventDefault();
    const h = e.currentTarget as HTMLElement;
    h.dataset.vistaIdx && this.open(parseInt(h.dataset.vistaIdx));
  };

  private defaultOnClickHandler: (e: PointerEvent) => void = (e) => e.preventDefault();

  private abortController: AbortController | null = null;

  constructor(elements: NodeListOf<HTMLElement> | VistaImg[], options: VistaOpt = {}) {
    this.elements = elements;

    this.options = {
      ...DefaultOptions,
      ...options,
      controls: {
        ...DefaultOptions.controls,
        ...options.controls,
      },
    };

    // setup user defined functions
    if (this.options.setupFunction) {
      this.setupFunction = this.options.setupFunction;
    }

    if (this.options.closeFunction) {
      this.closeFunction = this.options.closeFunction;
    }

    if (this.options.initFunction) {
      this.initFunction = this.options.initFunction;
    }

    if (this.options.transitionFunction) {
      this.transitionFunction = this.options.transitionFunction;
    }

    // detect reduced motion
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // set click listeners on elements
    if (this.elements instanceof NodeList) {
      this.elements.forEach((el, index) => {
        el.dataset.vistaIdx = index.toString();
        el.addEventListener('click', this.defaultOnClickHandler);
        el.addEventListener('pointerup', this.onClickElements);
      });
    }
  }

  private lastSwapTime = 0;
  private async swap(beforeIndex: number, via?: { next: boolean; prev: boolean }): Promise<void> {
    const allImage = this.options.preloads || 0;
    const index = this.currentIndex;

    const { htmls, images } = this.getChildElements(allImage, index);
    const imgs = this.imageContainer!;
    const c = this.currentChildren!;

    const vistaData = {
      htmlElements: { from: c.htmls, to: htmls },
      images: { from: c.images, to: images },
      index: { from: beforeIndex, to: this.currentIndex },
      via: via || { next: false, prev: false },
      vistaView: this,
    };

    this.setupFunction(vistaData);
    this.currentChildren = { htmls, images };
    this.displayActiveIndex();

    const abortControllerSignal = this.abortController!.signal;

    const now = performance.now();
    const rapid = now - this.lastSwapTime < this.options.rapidLimit!;
    let cleanup: void | (() => void) | null = null;
    if (!rapid) {
      cleanup = await this.transitionFunction(vistaData, abortControllerSignal);
    }
    this.lastSwapTime = now;

    // get info about old center image
    const idx = htmls[Math.floor(htmls.length / 2)].dataset.vvwIdx;
    const img0 = imgs.querySelector(
      `.vvw-item[data-vvw-idx="${idx}"] img.vvw-img-hi`
    ) as HTMLImageElement;

    const style = img0.getAttribute('style') || '';
    const loaded = img0.classList.contains('vvw--loaded');
    const ready = img0.classList.contains('vvw--ready');
    const width = img0.width;
    const height = img0.height;

    // swap elements
    imgs.innerHTML = '';
    if (cleanup instanceof Function) cleanup();
    htmls.forEach((vistaImg: HTMLDivElement) => {
      // is this position 0?
      if (
        vistaImg.dataset.vvwPos === '0' &&
        !abortControllerSignal.aborted &&
        style &&
        loaded &&
        ready &&
        width &&
        height
      ) {
        const img = vistaImg.querySelector('img.vvw-img-hi') as HTMLImageElement;
        img.classList.add('vvw--loaded');
        img.classList.add('vvw--ready');
        img.setAttribute('style', style);
        img.width = width;
        img.height = height;
      }

      imgs.appendChild(vistaImg);
    });

    this.waitForImagesToLoad();
    this.options.onImageView && this.options.onImageView(vistaData);
  }

  private getChildElements(
    positionalIndex: number,
    index: number
  ): { htmls: HTMLDivElement[]; images: VistaImgIdx[] } {
    const htmls: HTMLDivElement[] = [];
    const images: VistaImgIdx[] = [];
    for (let i = -positionalIndex; i <= positionalIndex; i++) {
      const elmIndex = (index + i + this.elements.length) % this.elements.length;
      const elm = this.elements[elmIndex];
      const img =
        elm instanceof HTMLImageElement
          ? elm
          : elm instanceof HTMLAnchorElement
            ? elm.querySelector('img') || undefined
            : undefined;

      const vistaImg: VistaImgIdx =
        elm instanceof HTMLElement
          ? {
              index: elmIndex,
              imageElm: img instanceof HTMLImageElement ? img : undefined,
              anchorElm: elm instanceof HTMLAnchorElement ? elm : undefined,
              src:
                elm.dataset.vistaviewSrc ||
                elm.getAttribute('href') ||
                elm.getAttribute('src') ||
                '',
              thumb:
                elm.dataset.vistaviewThumb ||
                (img instanceof HTMLImageElement ? img.getAttribute('src') : undefined) ||
                elm.getAttribute('href') ||
                undefined,
              alt:
                img instanceof HTMLImageElement ? img.getAttribute('alt') || undefined : undefined,
            }
          : {
              index: elmIndex,
              ...(elm as VistaImg),
            };

      images.push(vistaImg);
      htmls.push(vistaViewItem(vistaImg, i));
    }

    return {
      htmls,
      images,
    };
  }

  isZoomedIn: boolean = false;
  private zoomIn(): void {}
  private zoomOut(): void {}
  private zoom(_point: number, _center?: { x: number; y: number }): void {}

  private displayActiveIndex(): void {
    const cid = this.currentIndex;

    // set opacity in element
    if (this.elements instanceof NodeList) {
      this.elements.forEach((el, idx) => {
        el.style.opacity = '';
        if (idx === cid) {
          el.style.opacity = '0';
        }
      });
    }

    const indexDisplay = this.qs<HTMLDivElement>('.vvw-index');
    if (indexDisplay) {
      indexDisplay.textContent = `${cid + 1} / ${this.elements.length}`;
    }

    const description = this.qs<HTMLDivElement>('.vvw-desc');
    if (description) {
      const currentImg = this.currentChildren?.images.find((img) => img.index === cid);
      if (currentImg && currentImg.alt) {
        description.textContent = currentImg.alt;
      } else {
        description.textContent = '';
      }
    }
  }

  private waitForImagesToLoad(onImgLoaded?: () => void, signal?: AbortSignal): void {
    const imgs = this.imageContainer!;
    const imgElements = imgs.querySelectorAll('img.vvw-img-hi:not(.vvw--loaded)');
    imgElements.forEach((img) => {
      const im = img as HTMLImageElement;

      function onLoaded() {
        if (signal?.aborted) return;
        im.width = im.naturalWidth;
        im.height = im.naturalHeight;

        im.addEventListener(
          'transitionend',
          () => {
            if (signal?.aborted) return;
            im.classList.add('vvw--ready');
          },
          { once: true }
        );

        im.classList.add('vvw--loaded');
        onImgLoaded && onImgLoaded();
        requestAnimationFrame(() => {
          if (signal?.aborted) return;
          const { width, height } = getFullSizeDim(im);
          im.style.setProperty('--vvw-current-w', `${width}px`);
          im.style.setProperty('--vvw-current-h', `${height}px`);
          im.style.setProperty('--vvw-current-radius', `0px`);
        });
      }

      if (im.complete && im.naturalWidth !== 0) {
        onLoaded();
        return;
      }

      im.addEventListener('load', () => {
        onLoaded();
      });

      im.addEventListener('error', () => {
        im.classList.add('vvw--loaderror');
      });
    });
  }

  private onKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.next();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.zoomIn();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.zoomOut();
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
    }
  };

  private onScroll = (e: Event) => {
    e.preventDefault();
    const delta = (e as WheelEvent).deltaY;
    if (delta < 0) {
      this.zoomIn();
    } else if (delta > 0) {
      this.zoomOut();
    }
  };

  private onResizeHandler = () => {
    this.currentChildren!.htmls.forEach((htmlDiv, i) => {
      const vistaImg = this.currentChildren!.images[i];
      const hi = htmlDiv.querySelector('img.vvw-img-hi') as HTMLImageElement;
      const lo = htmlDiv.querySelector('img.vvw-img-lo') as HTMLImageElement;

      // update styles info
      setImageStyles(vistaImg, hi, lo, false);

      // update current image size
      if (hi.classList.contains('vvw--loaded')) {
        const { width, height } = getFullSizeDim(hi);
        hi.style.setProperty('--vvw-current-w', `${width}px`);
        hi.style.setProperty('--vvw-current-h', `${height}px`);
      }
    });
  };

  /// POINTERS
  private pointerListeners: ((e: VistaExternalPointerListenerArgs) => void)[] = [];
  registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void {
    this.pointerListeners.push(listener);
  }
  private unregisterPointerListeners(): void {
    this.pointerListeners = [];
  }

  private getPointerListener = () => {
    const imageState = new VistaImageState(this.options.maxZoomLevel!);
    const throttle = new Throttle();
    let lastDistance = 0;
    let lastRatio = 0;
    let disableMove = false;
    let lastPointerDown = {
      x: 0,
      y: 0,
      time: 0,
    };

    return (e: VistaPointerListenerArgs) => {
      this.zoom(0);

      console.log(imageState, throttle, lastDistance, lastRatio, disableMove, lastPointerDown);

      // external listeners
      this.pointerListeners.forEach((l) =>
        l({
          ...e,
          hasInternalExecution: this.isZoomedIn,
        })
      );
    };
  };

  /// OPEN
  open(startIndex: number = 0): void {
    if (GlobalVistaState.somethingOpened) {
      console.warn(
        'Another VistaView instance is already opened. Close it first before opening a new one.'
      );
      return;
    }

    GlobalVistaState.somethingOpened = this;
    this.currentIndex = startIndex;

    // setting up root component
    const root = vistaViewComponent({
      controls: this.options.controls,
    });

    document.body.prepend(root);
    this.root = document.body.querySelector('#vvw-root');

    if (!this.root) {
      throw new Error('Failed to setup VistaView root element.');
    }

    this.imageContainer = this.qs('.vvw-image-container');

    // add options
    if (this.options.animationDurationBase) {
      this.root.style.setProperty('--vvw-anim-dur', `${this.options.animationDurationBase}`);
    }

    if (this.options.initialZIndex !== undefined) {
      this.root.style.setProperty('--vvw-init-z', `${this.options.initialZIndex}`);
    }

    // setting up image, with preloads
    const allImage = this.options.preloads || 0;
    const index = startIndex;
    const { images, htmls } = this.getChildElements(allImage, index);

    const vistaData = {
      htmlElements: { from: null, to: htmls },
      images: { from: null, to: images },
      index: { from: null, to: this.currentIndex },
      via: { next: false, prev: false },
      vistaView: this,
    };

    this.setupFunction(vistaData);

    this.currentChildren = { htmls, images };
    htmls.forEach((vistaImg) => {
      this.imageContainer!.appendChild(vistaImg);
    });

    // set action buttons
    // set buttons' event listeners
    this.qs('.vvw-close')?.addEventListener('click', () => this.close());
    this.qs('.vvw-zoom-in')?.addEventListener('click', () => this.zoomIn());
    this.qs('.vvw-zoom-out')?.addEventListener('click', () => this.zoomOut());
    this.qs('.vvw-prev>button')?.addEventListener('click', () => this.prev());
    this.qs('.vvw-next>button')?.addEventListener('click', () => this.next());

    // background click to close
    this.qs('.vvw-bg')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.close();
    });

    // keyboard events
    window.addEventListener('keydown', this.onKeyDown);

    // scroll Events
    this.root.addEventListener('wheel', this.onScroll, { passive: false });

    // resize listener
    window.addEventListener('resize', this.onResizeHandler);

    // pointer listener
    this.pointers = new VistaPointers(this.imageContainer!, [this.getPointerListener()], true);

    // set custom controls' event listeners
    const customControls: { [key: string]: VistaCustomCtrl } = {};
    [
      ...(this.options.controls!.topLeft || []),
      ...(this.options.controls!.topRight || []),
      ...(this.options.controls!.topCenter || []),
      ...(this.options.controls!.bottomCenter || []),
      ...(this.options.controls!.bottomLeft || []),
      ...(this.options.controls!.bottomRight || []),
    ].forEach((c) => {
      if (typeof c !== 'string') customControls[c.name] = c;
    });

    this.root.querySelectorAll(`button[data-vvw-control]`).forEach((b) => {
      const btn = b as HTMLButtonElement;
      btn.addEventListener('click', (e: MouseEvent) => {
        const name = (e.currentTarget as HTMLButtonElement).dataset.vvwControl!;
        const control = customControls[name];
        const currentImage = this.currentChildren!.images.find(
          (img) => img.index === this.currentIndex
        );
        if (control && currentImage) {
          if (control.onClick.constructor.name === 'AsyncFunction') {
            btn.classList.add('vvw--loading');
            (control.onClick(currentImage, this) as Promise<void>).finally(() => {
              btn.classList.remove('vvw--loading');
            });
          } else {
            control.onClick(currentImage, this);
          }
        }
      });
    });

    // call init function, before activation
    this.initFunction(this);

    requestAnimationFrame(() => {
      this.root?.addEventListener(
        'transitionend',
        () => {
          this.root?.classList.add('vvw--settled');
          this.waitForImagesToLoad();
        },
        { once: true }
      );

      this.root!.classList.add('vvw--active');
      this.displayActiveIndex();
      this.options.onOpen && this.options.onOpen(this);
      this.options.onImageView && this.options.onImageView(vistaData);
    });
  }

  /// CLOSE
  async close(animate: boolean = true): Promise<void> {
    if (GlobalVistaState.somethingOpened !== this) {
      return;
    }

    if (!this.root) {
      return;
    }

    if (animate) {
      await new Promise((resolve) => {
        const target = 3;
        let current = 0;
        this.root!.addEventListener('transitionend', (e) => {
          if (e.target !== this.root) return;
          current++;

          if (current === 2) {
            if (this.elements instanceof NodeList) {
              this.elements.forEach((el) => {
                el.style.opacity = '';
              });
            }
          }

          if (current === target) {
            resolve(null);
          }
        });
        this.root!.classList.add('vvw--closing');
      });
    } else {
      if (this.elements instanceof NodeList) {
        this.elements.forEach((el) => {
          el.style.opacity = '';
        });
      }
    }

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResizeHandler);
    this.root.removeEventListener('wheel', this.onScroll);
    this.unregisterPointerListeners();
    this.pointers!.removeListeners();
    this.root.remove();
    this.root = null;
    this.imageContainer = null;
    this.currentChildren = null;
    this.currentIndex = -1;

    GlobalVistaState.somethingOpened = null;
    this.closeFunction(this);
    this.options.onClose && this.options.onClose(this);
  }

  next(): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    const index = (this.currentIndex + 1) % this.elements.length;
    this.view(index, { next: true, prev: false });
  }

  prev(): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    const index = (this.currentIndex - 1 + this.elements.length) % this.elements.length;
    this.view(index, { next: false, prev: true });
  }

  destroy(): void {
    // close without animation
    this.close(false);

    // remove click listeners on elements
    if (this.elements instanceof NodeList) {
      this.elements.forEach((el) => {
        el.removeAttribute('data-vista-idx');
        el.removeEventListener('click', this.defaultOnClickHandler);
        el.removeEventListener('pointerup', this.onClickElements);
      });
    }
  }

  getCurrentIndex(): number {
    if (GlobalVistaState.somethingOpened !== this) {
      return -1;
    }
    return this.currentIndex;
  }

  view(index: number, via?: { next: boolean; prev: boolean }): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    if (index < 0 || index >= this.elements.length) {
      console.warn('Index out of bounds:', index);
      return;
    }
    const before = this.currentIndex;
    this.currentIndex = index;

    // abort previous transition
    const abortController = this.abortController;
    abortController?.abort();

    // set abort controller
    this.abortController = new AbortController();
    this.swap(before, via);
  }
}
