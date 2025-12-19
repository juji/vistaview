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
import { VistaImageState, type VistaImageStateScaleParams } from './image-state';
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
  private imageState: VistaImageState;
  private imageTransitions: Map<
    HTMLImageElement,
    {
      current: { width: number; height: number; radius: number };
      target: { width: number; height: number; radius: number };
    }
  > = new Map();

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

  private throttle = new Throttle();

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

    this.imageState = new VistaImageState(
      this.options.maxZoomLevel!,
      (par: VistaImageStateScaleParams) => {
        // handle scale changes
        if (par.isMin) {
          this.isZoomedIn = false;
          this.qs('.vvw-zoom-out')?.setAttribute('disabled', 'true');
        } else {
          this.isZoomedIn = true;
          this.qs('.vvw-zoom-out')?.removeAttribute('disabled');
        }

        if (par.isMax) {
          this.qs('.vvw-zoom-in')?.setAttribute('disabled', 'true');
        } else {
          this.qs('.vvw-zoom-in')?.removeAttribute('disabled');
        }
      }
    );

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

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

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

  // ============================================================================
  // SWAP LOGIC - handles image transitions between prev/next
  // ============================================================================

  private lastSwapTime = 0;
  private isRapidSwap = false;
  private isRapidSwapRelease = 0;
  private transitionCleanup: (() => void) | null = null;

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

    // Check if this is a rapid swap (user navigating quickly)
    const now = performance.now();
    const rapid = now - this.lastSwapTime < this.options.rapidLimit!;
    this.isRapidSwap = rapid;

    // Cancel pending image loads from previous swap
    imgs
      .querySelectorAll(`.vvw-item img.vvw-img-hi`)
      .forEach((img) => img.classList.add('vvw--load-cancelled'));

    // RAPID SWAP: Skip transition, just update DOM immediately
    if (rapid) {
      this.imageState.reset();

      imgs.innerHTML = '';
      this.transitionCleanup && this.transitionCleanup();
      htmls.forEach((vistaImg: HTMLDivElement) => {
        imgs.appendChild(vistaImg);
      });
      this.lastSwapTime = performance.now();

      this.waitForImagesToLoad();
      this.options.onImageView && this.options.onImageView(vistaData);

      // Set cooldown period before allowing normal transitions again
      if (this.isRapidSwapRelease) clearTimeout(this.isRapidSwapRelease);
      this.isRapidSwapRelease = setTimeout(() => {
        this.isRapidSwap = false;
      }, 333);
      return;
    }

    // NORMAL SWAP: Run transition animation
    const res = this.transitionFunction(vistaData, abortControllerSignal);
    if (res) {
      this.transitionCleanup = res.cleanup;
      await res.transitionEnded;
    }
    this.lastSwapTime = performance.now();

    // Preserve animation state from old center image to avoid jarring resets
    // -----
    const idx = htmls[Math.floor(htmls.length / 2)].dataset.vvwIdx;
    const img0 = imgs.querySelector(
      `.vvw-item[data-vvw-idx="${idx}"] img.vvw-img-hi`
    ) as HTMLImageElement;

    const animation = this.imageTransitions.get(img0);
    this.imageTransitions.delete(img0);

    const style = img0.getAttribute('style') || '';
    const loaded = img0.classList.contains('vvw--loaded');
    const ready = img0.classList.contains('vvw--ready');
    const width = img0.width;
    const height = img0.height;
    // -----

    // reset image state
    this.imageState.reset();

    // swap elements
    imgs.innerHTML = '';
    if (this.transitionCleanup) this.transitionCleanup();
    htmls.forEach((vistaImg: HTMLDivElement) => {
      const img = vistaImg.querySelector('img.vvw-img-hi') as HTMLImageElement;

      // is this position 0?
      // setup styles accordingly
      if (
        vistaImg.dataset.vvwPos === '0' &&
        !abortControllerSignal.aborted &&
        style &&
        width &&
        height
      ) {
        if (loaded) {
          img.classList.add('vvw--loaded');
          img.dataset.vvwWidth = img0.dataset.vvwWidth || '';
          img.dataset.vvwHeight = img0.dataset.vvwHeight || '';
        }
        if (ready) {
          img.classList.add('vvw--ready');
          img.width = width;
          img.height = height;
        }
        img.setAttribute('style', style);
      }

      imgs.appendChild(vistaImg);

      if (vistaImg.dataset.vvwPos === '0' && !abortControllerSignal.aborted && ready) {
        // for ready elements, set current image again
        this.imageState.setCurrentImage(img);
        this.imageState.setInitialCenter();
      } else if (
        // for non-ready elements, restore animation state
        vistaImg.dataset.vvwPos === '0' &&
        !abortControllerSignal.aborted &&
        style &&
        width &&
        height &&
        loaded &&
        animation
      ) {
        this.imageTransitions.set(img, animation);
        this.transitionImage(img, () => {
          this.imageState.setCurrentImage(img);
          this.imageState.setInitialCenter();
          img.classList.add('vvw--ready');
        });
      }
    });

    this.isRapidSwap = false;
    this.waitForImagesToLoad();
    this.options.onImageView && this.options.onImageView(vistaData);
  }

  // ============================================================================
  // ZOOM CONTROLS
  // ============================================================================

  isZoomedIn: boolean = false;

  private zoomIn(): void {
    this.throttle.fio(
      () => {
        this.imageState.animateZoom(1.68);
      },
      'zoom',
      222
    );
  }
  private zoomOut(): void {
    this.throttle.fio(
      () => {
        this.imageState.animateZoom(0.68);
      },
      'zoom',
      222
    );
  }

  // ============================================================================
  // UI UPDATES
  // ============================================================================

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
    const indexText = `${cid + 1}`;
    const indexTotal = `${this.elements.length}`;
    if (indexDisplay) {
      indexDisplay.textContent = `${indexText} / ${indexTotal}`;
    }

    const description = this.qs<HTMLDivElement>('.vvw-desc');
    if (description) {
      const currentImg = this.currentChildren?.images.find((img) => img.index === cid);
      const descText = currentImg?.alt || '';

      if (descText) {
        description.textContent = descText;
        description.setAttribute('aria-label', `Image ${indexText} of ${indexTotal}: ${descText}`);
      } else {
        description.textContent = '';
        description.setAttribute('aria-label', `Image ${indexText} of ${indexTotal}`);
      }
    }
  }

  // ============================================================================
  // IMAGE LOADING & TRANSITIONS
  // ============================================================================

  // to make image (.vvw-img-hi) transitions smoothly to target size
  private transitionImage(img: HTMLImageElement, onEnd: () => void): void {
    // rapid swaps will cancel transitions
    if (img.classList.contains('vvw--load-cancelled')) return;

    if (this.isRapidSwap) {
      requestAnimationFrame(() => {
        this.transitionImage(img, onEnd);
      });
      return;
    }

    requestAnimationFrame(() => {
      // this is also possible, that the animation was removed in between frames
      const animation = this.imageTransitions.get(img);
      if (!animation) {
        return;
      }

      if (img.classList.contains('vvw--load-cancelled')) return;
      const { current, target } = animation;
      const now = {
        width: current.width + (target.width - current.width) * 0.2,
        height: current.height + (target.height - current.height) * 0.2,
        radius: current.radius + (target.radius - current.radius) * 0.2,
      };

      if (
        Math.abs(now.width - target.width) < 1 &&
        Math.abs(now.height - target.height) < 1 &&
        Math.abs(now.radius - target.radius) < 1
      ) {
        img.style.setProperty('--vvw-current-w', `${target.width}px`);
        img.style.setProperty('--vvw-current-h', `${target.height}px`);
        img.style.setProperty('--vvw-current-radius', `${target.radius}px`);
        this.imageTransitions.delete(img);
        onEnd();
      } else {
        img.style.setProperty('--vvw-current-w', `${now.width}px`);
        img.style.setProperty('--vvw-current-h', `${now.height}px`);
        img.style.setProperty('--vvw-current-radius', `${now.radius}px`);
        this.imageTransitions.set(img, { current: now, target });
        this.transitionImage(img, onEnd /* false */);
      }
    });
  }

  // wait, and add classes to high-res images when they load
  private waitForImagesToLoad(): void {
    const imgs = this.imageContainer!;
    const imgElements = imgs.querySelectorAll('img.vvw-img-hi:not(.vvw--loaded)');
    imgElements.forEach((img) => {
      const im = img as HTMLImageElement;

      if (im.classList.contains('vvw--load-cancelled')) return;

      const onLoaded = () => {
        if (im.classList.contains('vvw--load-cancelled')) return;

        im.width = im.naturalWidth;
        im.height = im.naturalHeight;

        const { width, height } = getFullSizeDim(im);
        im.dataset.vvwWidth = width.toString();
        im.dataset.vvwHeight = height.toString();
        im.classList.add('vvw--loaded');

        this.imageTransitions.set(im, {
          current: {
            width: im.style.getPropertyValue('--vvw-current-w')
              ? parseFloat(im.style.getPropertyValue('--vvw-current-w'))
              : 0,
            height: im.style.getPropertyValue('--vvw-current-h')
              ? parseFloat(im.style.getPropertyValue('--vvw-current-h'))
              : 0,
            radius: im.style.getPropertyValue('--vvw-current-radius')
              ? parseFloat(im.style.getPropertyValue('--vvw-current-radius'))
              : 0,
          },
          target: { width: width, height: height, radius: 0 },
        });

        this.transitionImage(im, () => {
          if (im.classList.contains('vvw--load-cancelled')) return;

          const isCurrentIndex = im.parentElement?.matches(
            `[data-vvw-idx="${this.currentIndex}"][data-vvw-pos="0"]`
          );

          if (isCurrentIndex) {
            this.imageState.setCurrentImage(im);
            this.imageState.setInitialCenter();
          }

          im.classList.add('vvw--ready');
        });
      };

      // sometimes the image is already loaded
      if (im.complete && im.naturalWidth !== 0) {
        onLoaded();
        return;
      }

      // and otherwise, wait for load event
      im.addEventListener('load', () => {
        onLoaded();
      });

      // handle image load errors
      im.addEventListener('error', () => {
        im.classList.add('vvw--loaderror');
        const errorMsg = document.createElement('p');
        errorMsg.className = 'vvw-img-err';
        errorMsg.setAttribute('role', 'alert');
        errorMsg.textContent = 'Error loading image';
        im.parentNode?.appendChild(errorMsg);
      });
    });
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

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
    this.imageState.setInitialCenter({
      x: (e as WheelEvent).clientX,
      y: (e as WheelEvent).clientY,
    });
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
        hi.dataset.vvwWidth = width.toString();
        hi.dataset.vvwHeight = height.toString();
      }
    });
  };

  /// POINTERS
  private pointerListeners: ((e: VistaExternalPointerListenerArgs) => void)[] = [];
  // ============================================================================
  // POINTER EVENT MANAGEMENT
  // ============================================================================

  // register external pointer listener
  registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void {
    this.pointerListeners.push(listener);
  }
  private unregisterPointerListeners(): void {
    this.pointerListeners = [];
  }

  // internal pointer listener
  // this is a function, called at open
  // the closure makes it easier to have local variables without polluting class scope
  private getInternalPointerListener() {
    const imgState = this.imageState;

    // Pinch gesture state
    let lastDistance = 0;
    let pinchMode = false;
    let lastPinchEndTime = 0;
    const PINCH_COOLDOWN = 33;
    let cancelMove = () => {};

    // Detect if we are pinching - to prevent conflict with single pointer move
    // Adds a small cooldown after pinch ends to avoid immediate single pointer move
    function isPinching() {
      return pinchMode || performance.now() - lastPinchEndTime < PINCH_COOLDOWN;
    }

    return (e: VistaPointerListenerArgs) => {
      // POINTER DOWN - Start drag or pinch
      if (e.event === 'down') {
        cancelMove();

        // Single finger: prepare for drag (if zoomed in)
        if (this.isZoomedIn && e.pointers.length === 1 && !isPinching()) {
          const center = this.pointers!.getCentroid();
          imgState.setInitialCenter(center!);
        }

        // Two fingers: start pinch zoom
        if (e.pointers.length >= 2) {
          pinchMode = true;
          const center = this.pointers!.getCentroid();
          lastDistance = this.pointers!.getPointerDistance(e.pointers[0], e.pointers[1]);
          imgState.setInitialCenter(center!);
        }
      }

      // POINTER MOVE - Drag or pinch zoom
      else if (e.event === 'move') {
        // Single finger drag (when zoomed in)
        if (this.isZoomedIn && e.pointers.length === 1 && e.lastPointerLen === 0 && !isPinching()) {
          const center = this.pointers!.getCentroid();
          imgState.move(center!);
        }

        // Two finger pinch zoom
        if (e.pointers.length >= 2 && pinchMode) {
          const center = this.pointers!.getCentroid();
          const distance = this.pointers!.getPointerDistance(e.pointers[0], e.pointers[1]);
          imgState.scaleMove(distance / lastDistance, center!);
        }
      }

      // POINTER UP - End drag/pinch, normalize position
      else if ((e.event === 'up' || e.event === 'cancel') && (pinchMode || this.isZoomedIn)) {
        if (pinchMode) {
          // End pinch: normalize zoom level, close if zoomed out too far
          lastPinchEndTime = performance.now();
          pinchMode = false;
          const close = imgState.normalize();
          if (close) {
            requestAnimationFrame(() => {
              this.close();
            });
          }
        } else if (this.isZoomedIn && e.pointers.length === 0 && !isPinching()) {
          // End drag: animate back to bounds if necessary
          cancelMove = imgState.moveAndNormalize(e.pointer!);
        }
      }

      // Notify external listeners (user-registered pointer handlers)
      this.pointerListeners.forEach((l) =>
        l({
          ...e,
          hasInternalExecution: this.isZoomedIn || isPinching(),
          abortController: this.abortController,
        })
      );
    };
  }

  /// OPEN
  // ============================================================================
  // LIFECYCLE METHODS - open, close, destroy
  // ============================================================================

  open(startIndex: number = 0): void {
    if (GlobalVistaState.somethingOpened) {
      console.warn(
        'Another VistaView instance is already opened. Close it first before opening a new one.'
      );
      return;
    }

    GlobalVistaState.somethingOpened = this;
    this.currentIndex = startIndex;

    // Prevent body scrolling
    document.body.style.overflow = 'hidden';

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

    // keyboard events
    if (this.options.keyboardListeners) window.addEventListener('keydown', this.onKeyDown);

    // scroll Events
    window.addEventListener('wheel', this.onScroll, { passive: false });

    // resize listener
    window.addEventListener('resize', this.onResizeHandler);

    // pointer listener
    this.pointers = new VistaPointers({
      elm: this.imageContainer!,
      listeners: [this.getInternalPointerListener()],
    });

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

    // when using single raf, sometimes the thumbnmail jumps
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.root?.addEventListener(
          'transitionend',
          () => {
            this.root?.classList.add('vvw--settled');
            this.imageState.reset();
            this.waitForImagesToLoad();
          },
          { once: true }
        );

        this.root!.classList.add('vvw--active');
        this.displayActiveIndex();
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

    if (this.options.keyboardListeners) window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResizeHandler);
    window.removeEventListener('wheel', this.onScroll);
    this.unregisterPointerListeners();
    this.pointers!.removeListeners();
    this.root.remove();
    this.root = null;
    this.imageContainer = null;
    this.currentChildren = null;
    this.currentIndex = -1;

    // Restore body scrolling
    document.body.style.overflow = '';

    GlobalVistaState.somethingOpened = null;
    this.closeFunction(this);
    this.options.onClose && this.options.onClose(this);
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

  // ============================================================================
  // NAVIGATION METHODS - next, prev, view
  // ============================================================================

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

  // ============================================================================
  // GETTERS
  // ============================================================================

  getCurrentIndex(): number {
    if (GlobalVistaState.somethingOpened !== this) {
      return -1;
    }
    return this.currentIndex;
  }
}
