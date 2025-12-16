import type {
  VistaCloseFn,
  VistaCustomCtrl,
  VistaImg,
  VistaImgIdx,
  VistaInitFn,
  VistaOpt,
  VistaSetupFn,
  VistaTransitionFn,
} from './types';
import { DefaultOptions } from './defaults/options';
import { vistaViewComponent, vistaViewItem } from './components';

import { setup } from './defaults/setup';
import { init } from './defaults/init';
import { close } from './defaults/close';
import { transition } from './defaults/transition';
import { getFullSizeDim } from './utils';

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

  private async swap(beforeIndex: number, via?: { next: boolean; prev: boolean }): Promise<void> {
    const allImage = (this.options.preloads || 0) + 1;
    const index = this.currentIndex;

    const { htmls, images } = this.getChildElements(allImage, index);
    const imgs = this.imageContainer!;
    const c = this.currentChildren!;

    const par = {
      htmlElements: { from: c.htmls, to: htmls },
      images: { from: c.images, to: images },
      index: { from: beforeIndex, to: this.currentIndex },
      via: via || { next: false, prev: false },
      vistaView: this,
    };

    this.setupFunction(par);
    this.currentChildren = { htmls, images };

    const abortController = this.abortController!;
    const cleanup = await this.transitionFunction(par, abortController.signal);

    const idx = htmls[Math.floor(htmls.length / 2)].dataset.vvwIdx;
    const img0 = imgs.querySelector(
      `.vvw-item[data-vvw-idx="${idx}"] img.vvw-img-hi`
    ) as HTMLImageElement;
    const dim = {
      dataWidth: img0.dataset.vvwInitWidth || '',
      dataHeight: img0.dataset.vvwInitHeight || '',
      styleWidth: img0.style.width || '',
      styleHeight: img0.style.height || '',
      naturalWidth: img0.naturalWidth || 0,
      naturalHeight: img0.naturalHeight || 0,
    };

    // swap elements
    imgs.innerHTML = '';
    if (cleanup instanceof Function) cleanup();
    htmls.forEach((vistaImg: HTMLDivElement) => {
      // is this position 0?
      if (
        vistaImg.dataset.vvwPos === '0' &&
        !abortController.signal.aborted &&
        dim.styleWidth &&
        dim.styleHeight &&
        dim.naturalHeight &&
        dim.naturalWidth &&
        dim.dataWidth &&
        dim.dataHeight
      ) {
        const img = vistaImg.querySelector('img.vvw-img-hi') as HTMLImageElement;
        img.classList.add('vvw-img--loaded');
        img.classList.add('vvw-img--ready');
        img.style.setProperty('width', dim.styleWidth);
        img.style.setProperty('height', dim.styleHeight);
        img.dataset.vvwInitWidth = dim.dataWidth;
        img.dataset.vvwInitHeight = dim.dataHeight;
        img.width = dim.naturalWidth;
        img.height = dim.naturalHeight;
      }

      imgs.appendChild(vistaImg);
    });
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

  private zoomIn(): void {}
  private zoomOut(): void {}

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

    this.setupFunction({
      htmlElements: { from: null, to: htmls },
      images: { from: null, to: images },
      index: { from: null, to: this.currentIndex },
      via: { next: false, prev: false },
      vistaView: this,
    });

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
      if (this.elements instanceof NodeList) {
        this.elements.forEach((el, idx) => {
          if (idx === this.currentIndex) {
            el.style.opacity = '0';
          }
        });
      }
    });
  }

  async close(animate: boolean = true): Promise<void> {
    if (GlobalVistaState.somethingOpened !== this) {
      return;
    }

    if (!this.root) {
      return;
    }

    if (animate && !this.isReducedMotion) {
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
    }

    if (this.elements instanceof NodeList) {
      this.elements.forEach((el) => {
        el.style.opacity = '';
      });
    }

    this.root.remove();
    this.root = null;
    this.imageContainer = null;
    this.currentChildren = null;
    this.currentIndex = -1;

    GlobalVistaState.somethingOpened = null;
    this.closeFunction(this);
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
