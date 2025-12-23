import type {
  VistaCloseFn,
  VistaCustomCtrl,
  VistaInitFn,
  VistaOpt,
  VistaSetupFn,
  VistaTransitionFn,
  VistaImgConfig,
  VistaExternalPointerListenerArgs,
} from './types';
import { DefaultOptions } from './defaults/options';
import { vistaViewComponent } from './components';

import { setup } from './defaults/setup';
import { init } from './defaults/init';
import { close } from './defaults/close';
import { transition } from './defaults/transition';
import { VistaImage } from './vista-image';
import { Throttle } from './throttle';
import { VistaEventHandlers } from './vista-event-handlers';
import { VistaState } from './vista-state';
import { VistaHiresTransition } from './vista-hires-transition';

export const GlobalVistaState: { somethingOpened: VistaView | null } = {
  somethingOpened: null,
};

export class VistaView {
  options: VistaOpt;
  state = new VistaState();
  imageContainer: HTMLElement | null = null;
  elmLength: number = 0;

  private elements: string | VistaImgConfig[];

  private setupFunction: VistaSetupFn = setup;
  private initFunction: VistaInitFn = init;
  private closeFunction: VistaCloseFn = close;
  private transitionFunction: VistaTransitionFn = transition;

  private eventHandlers = new VistaEventHandlers(this);
  private throttle = new Throttle();
  private root: HTMLElement | null = null;

  private onClickElements: (e: PointerEvent) => void = (e) => {
    e.preventDefault();
    const h = e.currentTarget as HTMLElement;
    h.dataset.vvwIdx && this.open(parseInt(h.dataset.vvwIdx));
  };

  private defaultOnClickHandler: (e: PointerEvent) => void = (e) => e.preventDefault();

  constructor(elements: string | VistaImgConfig[], options: VistaOpt = {}) {
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
    this.state.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // set click listeners on elements
    if (typeof this.elements === 'string') {
      const list = this.qsOrigin(this.elements as string);
      this.elmLength = list.length;
      list.forEach((el, index) => {
        const e = el as HTMLElement;
        e.dataset.vvwIdx = index.toString();
        e.addEventListener('click', this.defaultOnClickHandler);
        e.addEventListener('pointerup', this.onClickElements);
      });
    } else {
      this.elmLength = this.elements.length;
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  qs<T extends HTMLElement>(selector: string): T | null {
    return this.root ? (this.root.querySelector(selector) as T | null) : null;
  }

  qsOrigin<T extends NodeListOf<HTMLElement>>(selector: string): T {
    return document.querySelectorAll(selector) as T;
  }

  registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void {
    this.eventHandlers.registerPointerListener(listener);
  }

  private getChildElements(
    positionalIndex: number,
    index: number
  ): { images: VistaImage[]; htmls: HTMLDivElement[] } {
    const images: VistaImage[] = [];
    const htmls: HTMLDivElement[] = [];

    const elements =
      typeof this.elements === 'string'
        ? this.qsOrigin(this.elements as string)!
        : (this.elements as VistaImgConfig[]);

    for (let i = -positionalIndex; i <= positionalIndex; i++) {
      const elmIndex = (index + i + elements.length) % elements.length;
      const elm = elements[elmIndex] as HTMLImageElement | HTMLAnchorElement | VistaImgConfig;

      const vistaImg = new VistaImage({
        elm,
        pos: i,
        index: elmIndex,
        maxZoomLevel: this.options.maxZoomLevel!,
        transitionShouldWait: () => this.isRapidSwap,
        onScale: ({ vistaImage, isMin, isMax }) => {
          if (vistaImage.index === this.state.currentIndex) {
            this.state.zoomedIn = !isMin;

            if (isMin) {
              this.qs('.vvw-zoom-out')?.setAttribute('disabled', 'true');
            } else {
              this.qs('.vvw-zoom-out')?.removeAttribute('disabled');
            }

            if (isMax) {
              this.qs('.vvw-zoom-in')?.setAttribute('disabled', 'true');
            } else {
              this.qs('.vvw-zoom-in')?.removeAttribute('disabled');
            }
          }
        },
      });

      const div = document.createElement('div');
      div.className = 'vvw-item';
      div.dataset.vvwPos = `${i}`;
      div.dataset.vvwIdx = `${elmIndex}`;

      if (vistaImg.thumb) div.appendChild(vistaImg.thumb!);
      div.appendChild(vistaImg.image!);

      images.push(vistaImg);
      htmls.push(div);
    }

    return {
      htmls,
      images,
    };
  }

  // ============================================================================
  // SWAP LOGIC - handles image transitions between prev/next
  // ============================================================================

  private lastSwapTime = 0;
  private isRapidSwap = false;
  private isRapidSwapRelease = 0;
  private transitionCleanup: (() => void) | null = null;

  private async swap(beforeIndex: number, via?: { next: boolean; prev: boolean }): Promise<void> {
    const allImage = this.options.preloads || 0;
    const index = this.state.currentIndex;

    const { htmls, images } = this.getChildElements(allImage, index);
    const imgc = this.imageContainer!;
    const c = this.state.children;

    const vistaData = {
      htmlElements: { from: c.htmls, to: htmls },
      images: { from: c.images, to: images },
      index: { from: beforeIndex, to: this.state.currentIndex },
      via: via || { next: false, prev: false },
      vistaView: this,
    };

    this.setupFunction(vistaData);

    // RESET ZOOM STATE
    this.state.zoomedIn = false;
    this.qs('.vvw-zoom-out')?.setAttribute('disabled', 'true');
    this.qs('.vvw-zoom-in')?.removeAttribute('disabled');

    // Check if this is a rapid swap (user navigating quickly)
    const now = performance.now();
    const rapid = now - this.lastSwapTime < this.options.rapidLimit!;
    this.isRapidSwap = rapid;

    // can only setDescription after state.children is updated
    // so we cache current images first
    const { images: currentImages } = this.state.children;
    this.state.children = { htmls, images };
    this.displayCurrentInfo();

    if (rapid) {
      // Cancel pending image loads from previous swap
      currentImages.forEach((img) => {
        img.cancelPendingLoad();
        img.destroy();
      });
    } else {
      // NORMAL SWAP: Run transition animation
      const abortControllerSignal = this.state.abortController!.signal;
      const res = this.transitionFunction(vistaData, abortControllerSignal);
      if (res) {
        this.transitionCleanup = res.cleanup;
        await res.transitionEnded;
      }
      this.lastSwapTime = performance.now();

      // Cancel pending image loads from previous swap
      currentImages.forEach((img) => {
        img.cancelPendingLoad();
      });

      // Preserve animation state from old center image to avoid jarring resets
      // -----
      const img0 = currentImages.find((img) => img.index === index)!;
      const transitionState = img0 ? VistaHiresTransition.stop(img0) : undefined;
      const nextImg0 = images.find((img) => img.index === index);
      if (nextImg0 && img0) {
        nextImg0.cloneStyleFrom(img0, transitionState);
      }

      currentImages.forEach((img) => {
        img.destroy();
      });
    }

    // swap elements
    imgc.innerHTML = '';
    if (this.transitionCleanup) {
      this.transitionCleanup();
      this.transitionCleanup = null;
    }

    htmls.forEach((vistaImg: HTMLDivElement) => {
      imgc.appendChild(vistaImg);
    });

    images.forEach((img) => {
      img.waitForLoad();
    });

    if (rapid) {
      // Set cooldown period before allowing normal transitions again
      if (this.isRapidSwapRelease) clearTimeout(this.isRapidSwapRelease);
      this.isRapidSwapRelease = setTimeout(() => {
        this.isRapidSwap = false;
      }, 333);
    } else {
      this.isRapidSwap = false;
    }

    this.options.onImageView && this.options.onImageView(vistaData);
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================

  private displayCurrentInfo(): void {
    const cid = this.state.currentIndex;

    // set opacity in element
    if (typeof this.elements === 'string') {
      this.qsOrigin(this.elements as string).forEach((el, idx) => {
        el.style.opacity = '';
        if (idx === cid) {
          el.style.opacity = '0';
        }
      });
    }

    const indexDisplay = this.qs<HTMLDivElement>('.vvw-index');
    const indexText = `${cid + 1}`;
    const indexTotal = `${this.elmLength}`;
    if (indexDisplay) {
      indexDisplay.textContent = `${indexText} / ${indexTotal}`;
    }

    const description = this.qs<HTMLDivElement>('.vvw-desc');
    if (description) {
      const currentImg = this.state.children.images.find((img) => img.index === cid);
      const descText = currentImg?.config.alt || '';

      if (descText) {
        description.textContent = descText;
        description.setAttribute('aria-label', `Image ${indexText} of ${indexTotal}: ${descText}`);
        description.style.opacity = '';
      } else {
        description.textContent = '';
        description.setAttribute('aria-label', `Image ${indexText} of ${indexTotal}`);
        description.style.opacity = '0';
      }
    }
  }

  // ============================================================================
  // LIFECYCLE METHODS - open, close, destroy
  // ============================================================================

  // OPEN
  open(startIndex: number = 0): void {
    if (GlobalVistaState.somethingOpened) {
      console.warn(
        'Another VistaView instance is already opened. Close it first before opening a new one.'
      );
      return;
    }

    GlobalVistaState.somethingOpened = this;
    this.state.currentIndex = startIndex;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

    // setting up root component
    const root = vistaViewComponent({
      controls: this.options.controls,
    });

    document.body.append(root);
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
      this.root.style.setProperty('--vvw-init-z', `${this.options.initialZIndex ?? 0}`);
    }

    if (this.options.arrowOnSmallScreens) {
      this.root.classList.add('vvw-arrow-sm');
    }

    // setting up image, with preloads
    const allImage = this.options.preloads || 0;
    const index = startIndex;
    const { images, htmls } = this.getChildElements(allImage, index);

    const vistaData = {
      htmlElements: { from: null, to: htmls },
      images: { from: null, to: images },
      index: { from: null, to: this.state.currentIndex },
      via: { next: false, prev: false },
      vistaView: this,
    };

    this.setupFunction(vistaData);

    this.state.children = { htmls, images };
    htmls.forEach((vistaImg) => {
      this.imageContainer!.appendChild(vistaImg);
    });

    images.forEach((img) => {
      img.waitForLoad();
    });

    // set action buttons
    // set buttons' event listeners
    this.qs('.vvw-close')?.addEventListener('click', () => this.close());
    this.qs('.vvw-zoom-in')?.addEventListener('click', () => this.zoomIn());
    this.qs('.vvw-zoom-out')?.addEventListener('click', () => this.zoomOut());
    this.qs('.vvw-prev>button')?.addEventListener('click', () => this.prev());
    this.qs('.vvw-next>button')?.addEventListener('click', () => this.next());

    // set event handlers
    this.eventHandlers.start(this.imageContainer!);

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
        const currentImage = this.state.children.images.find(
          (img) => img.index === this.state.currentIndex
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

    // when using single raf, sometimes the thumbnmail jumps
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.root?.addEventListener(
          'transitionend',
          () => {
            this.root?.classList.add('vvw--settled');
          },
          { once: true }
        );

        this.root!.classList.add('vvw--active');
        this.displayCurrentInfo();
        this.options.onOpen && this.options.onOpen(this);
        this.options.onImageView && this.options.onImageView(vistaData);
      });
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

    this.state.children.images.forEach((img) => {
      img.prepareClose();
    });

    if (animate) {
      await new Promise((resolve) => {
        const target = 3;
        let current = 0;
        this.root!.addEventListener('transitionend', (e) => {
          if (e.target !== this.root) return;
          current++;

          if (current === 2) {
            if (typeof this.elements === 'string') {
              this.state.children.images.forEach((img) => {
                img.destroy();
              });
              this.qsOrigin(this.elements as string).forEach((el) => {
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
      if (typeof this.elements === 'string') {
        this.state.children.images.forEach((img) => {
          img.destroy();
        });
        this.qsOrigin(this.elements as string).forEach((el) => {
          el.style.opacity = '';
        });
      }
    }

    this.eventHandlers.stop();

    this.root.remove();
    this.root = null;
    this.imageContainer = null;
    this.state.children = { htmls: [], images: [] };
    this.state.currentIndex = -1;

    //
    this.state.children.images.forEach((img) => {
      img.destroy();
    });

    // Restore body scrolling
    document.body.style.overflow = '';

    GlobalVistaState.somethingOpened = null;
    this.closeFunction(this);
    this.options.onClose && this.options.onClose(this);
  }

  // DESTROY
  destroy(): void {
    // close without animation
    this.close(false);

    // remove click listeners on elements
    if (typeof this.elements === 'string') {
      this.qsOrigin(this.elements as string).forEach((el) => {
        el.removeAttribute('data-vista-idx');
        el.removeEventListener('click', this.defaultOnClickHandler);
        el.removeEventListener('pointerup', this.onClickElements);
      });
    }
  }

  // ============================================================================
  // NAVIGATION METHODS - next, prev, view
  // ============================================================================

  next(): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    const index = (this.state.currentIndex + 1) % this.elmLength;
    this.view(index, { next: true, prev: false });
  }

  prev(): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    const index = (this.state.currentIndex - 1 + this.elmLength) % this.elmLength;
    this.view(index, { next: false, prev: true });
  }

  view(index: number, via?: { next: boolean; prev: boolean }): void {
    if (GlobalVistaState.somethingOpened !== this) {
      console.warn('This VistaView instance is not opened.');
      return;
    }
    if (index < 0 || index >= this.elmLength) {
      console.warn('Index out of bounds:', index);
      return;
    }

    if (this.elmLength < 2) {
      return;
    }

    const before = this.state.currentIndex;
    this.state.currentIndex = index;

    // abort previous transition
    const abortController = this.state.abortController;
    abortController?.abort();

    // set abort controller
    this.state.abortController = new AbortController();
    this.swap(before, via);
  }

  // ============================================================================
  // ZOOM CONTROLS
  // ============================================================================

  isZoomedIn: boolean = false;

  zoomIn(): void {
    this.throttle.fio(
      () => {
        const image = this.state.children.images.find((img) => img.pos === 0);
        image?.animateZoom(1.68);
      },
      'zoom',
      222
    );
  }

  zoomOut(): void {
    this.throttle.fio(
      () => {
        const image = this.state.children.images.find((img) => img.pos === 0);
        image?.animateZoom(0.68);
      },
      'zoom',
      222
    );
  }

  getCurrentIndex(): number {
    return this.state.currentIndex;
  }
}
