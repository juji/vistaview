import { vistaViewComponent, vistaViewItem, vistaViewDownload } from './components';

import {
  getElmProperties,
  getFittedSize,
  getFullSizeDim,
  getMaxMinZoomLevels,
  isNotZeroCssValue,
} from './utils';

import type {
  VistaViewCloseFunction,
  VistaViewSetupFunction,
  VistaViewTransitionFunction,
  VistaViewCustomControl,
  VistaViewImage,
  VistaViewImageIndexed,
  VistaViewOptions,
  VistaViewInitFunction,
} from './types';

import { defaultSetup, defaultTransition, defaultClose, defaultInit } from './defaults';

export class VistaViewTransitionAbortedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VistaViewTransitionAbortedError';
  }
}

export const DefaultOptions = {
  detectReducedMotion: true,
  // debug, don't remove
  // animationDurationBase: 1000,
  animationDurationBase: 333,
  zoomStep: 500,
  maxZoomLevel: 2,
  touchSpeedThreshold: 0.5,
  preloads: 1,
  keyboardListeners: true,
  arrowOnSmallScreens: false,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', vistaViewDownload(), 'close'],
    bottomCenter: ['description'],
  } as VistaViewOptions['controls'],
};

export const GlobalVistaState: { somethingOpened: VistaView | null } = {
  somethingOpened: null,
};

export class VistaView {
  options: VistaViewOptions;
  elements: NodeListOf<HTMLElement> | VistaViewImage[];
  isReducedMotion: boolean;
  currentIndex = {
    _value: null as number | null,
    _vistaView: null as VistaView | null,
    _via: { next: false, prev: false },
    set value(v: number) {
      const beforeIndex = this._value;
      this._value = v;
      for (const key in this._vistaView?.transitionAbortControllers) {
        this._vistaView?.transitionAbortControllers[key].abort();
      }
      this._vistaView?.swap(beforeIndex, this._value);
    },
    get value(): number | null {
      return this._value;
    },
    get via() {
      return this._via;
    },
    set via(v: { next: boolean; prev: boolean }) {
      this._via = v;
    },
  };

  rootElm: HTMLElement | null = null;
  imageContainerElm: HTMLElement | null = null;
  customControls: { [key: string]: VistaViewCustomControl } = {};
  currentImages: VistaViewImageIndexed[] | null = null;
  currentItems: HTMLDivElement[] | null = null;
  isZoomed: HTMLImageElement | false = false;

  private onClickElements: (e: PointerEvent) => void = (e) => {
    e.preventDefault();
    const someHtml = e.currentTarget as HTMLElement;
    someHtml.dataset.vistaviewIndex && this.open(parseInt(someHtml.dataset.vistaviewIndex));
  };
  private defaultOnClickHandler: (e: PointerEvent) => void = (e) => e.preventDefault();

  private onResizeHandler: (() => void) | null = null;
  private onKeyDown: ((e: KeyboardEvent) => void) | null = null;

  private userSetup: VistaViewSetupFunction = defaultSetup;
  private userTransition: VistaViewTransitionFunction = defaultTransition;
  private userClose: VistaViewCloseFunction = defaultClose;
  private userInit: VistaViewInitFunction = defaultInit;

  private onZoomedPointerDown: ((e: PointerEvent) => void) | null = null;
  private onZoomedPointerMove: ((e: PointerEvent) => void) | null = null;
  private onZoomedPointerUp: ((e: PointerEvent) => void) | null = null;

  private transitionAbortControllers: { [key: string]: AbortController } = {};

  constructor(elements: NodeListOf<HTMLElement> | VistaViewImage[], options?: VistaViewOptions) {
    this.elements = elements;
    this.currentIndex._vistaView = this;

    // merge options
    this.options = {
      ...DefaultOptions,
      ...(options || {}),
      controls: {
        ...DefaultOptions.controls,
        ...(options?.controls || {}),
      },
    };

    if (this.options.initFunction) {
      this.userInit = this.options.initFunction;
    }

    if (this.options.transitionFunction) {
      this.userTransition = this.options.transitionFunction;
    }

    if (this.options.closeFunction) {
      this.userClose = this.options.closeFunction;
    }

    if (this.options.initFunction) {
      this.userInit = this.options.initFunction;
    }

    // detect reduced motion
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // set click listeners on elements
    if (this.elements instanceof NodeList) {
      this.elements.forEach((el, index) => {
        el.dataset.vistaviewIndex = index.toString();
        el.addEventListener('click', this.defaultOnClickHandler);
        el.addEventListener('pointerup', this.onClickElements);
      });
    }
  }

  private setFullSizeImageDim(im: HTMLImageElement): void {
    const dim = im.getBoundingClientRect();
    const { width, height } = getFullSizeDim(im);
    if (width === dim.width && height === dim.height) {
      im.parentElement
        ?.querySelector('.vistaview-image-lowres')
        ?.classList.add('vistaview-image--hidden');
      im.classList.add('vistaview-image-settled');
    } else {
      let transitionNum = 0;
      const onImageTransitionEnd = () => {
        transitionNum++;
        if (transitionNum < 3) return;

        im.removeEventListener('transitionend', onImageTransitionEnd);
        im.parentElement
          ?.querySelector('.vistaview-image-lowres')
          ?.classList.add('vistaview-image--hidden');
        im.classList.add('vistaview-image-settled');
      };
      requestAnimationFrame(() => {
        im.addEventListener('transitionend', onImageTransitionEnd);
        im.style.width = `${width}px`;
        im.style.height = `${height}px`;
      });
    }
  }

  // weird on iphones
  // private loadImageWaiting = (img: HTMLImageElement): Promise<void> => {
  //   return new Promise((resolve) => {
  //     const observer = new MutationObserver((mutations) => {
  //       mutations.forEach((mutation) => {
  //         if (
  //           mutation.type === 'attributes' &&
  //           mutation.attributeName === 'class' &&
  //           (mutation.target as HTMLElement).classList.contains('vistaview-image-settled')
  //         ) {
  //           console.log('vistaview-image-settled detected')
  //           resolve()
  //         }
  //       });

  //       // Start observing
  //       observer.observe(img, {
  //         attributes: true,
  //         attributeOldValue: true,
  //         attributeFilter: ['class']
  //       });
  //     });

  //   });
  // };

  private loadImageTimeout: ReturnType<typeof setTimeout> | null = null;
  private async swap(beforeIndex: number | null, afterIndex: number): Promise<void> {
    if (!GlobalVistaState.somethingOpened) return;
    if (beforeIndex === afterIndex) return;
    if (beforeIndex === null) return;
    // if (this.elements.length === 1) return;

    if (!this.imageContainerElm) {
      throw new Error('VistaView: imageContainerElm is null in swap()');
    }

    //
    this.setIndexDisplay();

    // Normalize image before viewing another image
    this.clearZoom();

    // get images,
    // check if it's already loaded, if yes, set dimensions right away
    const { images: activeIndexes, positions: activePositions } =
      this.getCurrentIndexes(afterIndex);
    const images = this.getImages(activeIndexes);
    const elms = images.map((img, i) => vistaViewItem(img, activePositions[i]));

    const transitionParams = {
      htmlElements: { from: this.currentItems, to: elms },
      images: { from: this.currentImages, to: images },
      index: { from: beforeIndex, to: afterIndex },
      via: this.currentIndex.via,
      container: this.imageContainerElm,
      elements: this.elements,
      isReducedMotion: this.isReducedMotion,
      isZoomed: this.isZoomed,
      options: this.options,
    };

    this.userSetup(transitionParams);

    // before transition
    // add add --ending class to current items
    // to prevent loading images from animating
    // this.currentItems?.forEach((element) => {
    //   element.classList.add('vistaview-image--ending');
    // });

    // do the swap, this is where the animation would go
    const abortKey =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.transitionAbortControllers[abortKey] = new AbortController();
    try {
      await this.userTransition(transitionParams, this.transitionAbortControllers[abortKey].signal);
    } catch (error) {
      if (!(error instanceof VistaViewTransitionAbortedError)) {
        console.warn(error);
      }
    }

    const indexZero = elms!.find((elm) => elm.dataset.vistaviewPos === '0');
    if (indexZero) {
      const itemIndex = indexZero.dataset.vistaviewIndex;
      // ensure the last elements attributes are used
      const lastElm = this.currentItems!.find((v) => v.dataset.vistaviewIndex === itemIndex)!;
      const lastElmImage = lastElm?.querySelector('.vistaview-image-highres') as HTMLImageElement;
      if (lastElmImage) {
        const currentImage = indexZero.querySelector(
          '.vistaview-image-highres'
        ) as HTMLImageElement;
        currentImage.setAttribute('class', lastElmImage.getAttribute('class') || '');
        currentImage.setAttribute('style', lastElmImage.getAttribute('style') || '');
        currentImage.classList.remove('vistaview-image--zooming');

        // this smoehow doesn't work.
        // some elements, while loading don't have widtha and height
        // making width and height zero
        // const dim = lastElmImage.getBoundingClientRect();
        // currentImage.style.width = `${dim.width}px`;
        // currentImage.style.height = `${dim.height}px`;

        // how about preserving attributes while in transtition?
        // this will make it janky... it will stop the smoothness of transition
        if (
          lastElmImage.classList.contains('vistaview-image-loaded') &&
          !lastElmImage.classList.contains('vistaview-image-settled')
        ) {
          const dim = lastElmImage.getBoundingClientRect();
          currentImage.style.width = `${dim.width}px`;
          currentImage.style.height = `${dim.height}px`;
        }

        // okay, we wait for the image to be settled
        // but this is weird on iphones
        // so we go back to the last approach
        // if (
        //   lastElmImage.classList.contains('vistaview-image-loaded') &&
        //   !lastElmImage.classList.contains('vistaview-image-settled')
        // ) {
        //   console.log('waiting for vistaview-image-settled')
        //   await this.loadImageWaiting(lastElmImage).then(() => {
        //     if(!this.transitionAbortControllers[abortKey]) return;
        //     if(this.transitionAbortControllers[abortKey].signal.aborted) return;
        //     const dim = lastElmImage.getBoundingClientRect();
        //     currentImage.style.width = `${dim.width}px`;
        //     currentImage.style.height = `${dim.height}px`;
        //     currentImage.classList.add('vistaview-image-settled');
        //   });
        // }
      }
    }

    delete this.transitionAbortControllers[abortKey];
    this.imageContainerElm!.innerHTML = '';
    elms!.forEach((elm) => {
      const im = elm.querySelector('.vistaview-image-highres') as HTMLImageElement;
      const loaded = im.classList.contains('vistaview-image-loaded') ? true : false;
      const settled = im.classList.contains('vistaview-image-settled') ? true : false;
      this.imageContainerElm!.appendChild(elm);

      if (loaded && !settled) {
        this.setFullSizeImageDim(im);
      } else if (loaded && settled) {
        elm?.querySelector('.vistaview-image-lowres')?.classList.add('vistaview-image--hidden');
      }
    });

    this.setInitialDimPos();
    this.currentImages = images;
    this.currentItems = elms;
    this.setCurrentDescription();
    this.updateZoomButtonsVisibility();
    this.options.onImageView?.(transitionParams);

    // prevent multiple loading when rapidly navigating
    if (this.loadImageTimeout) clearTimeout(this.loadImageTimeout);
    this.loadImageTimeout = setTimeout(() => {
      this.loadImages();
    }, 333);
  }

  //
  private setZoomed(image: HTMLImageElement | false): void {
    if (this.isZoomed === image) return;

    // this needs to be first
    // basically remove event listeners from previous zoomed image
    if (this.isZoomed) {
      let img = this.isZoomed;
      img.classList.remove('vistaview-image--zooming');

      if (this.onZoomedPointerDown) {
        img.parentElement?.removeEventListener('pointerdown', this.onZoomedPointerDown!);
        this.onZoomedPointerDown = null;
      }
      if (this.onZoomedPointerMove) {
        img.parentElement?.removeEventListener('pointermove', this.onZoomedPointerMove!);
        this.onZoomedPointerMove = null;
      }
      if (this.onZoomedPointerUp) {
        img.parentElement?.removeEventListener('pointerup', this.onZoomedPointerUp!);
        this.onZoomedPointerUp = null;
      }
      img?.style.removeProperty('--pointer-diff-x');
      img?.style.removeProperty('--pointer-diff-y');
      setTimeout(() => {
        img?.classList.remove('vistaview-image--zooming');
      }, 500);

      this.isZoomed = false;

      if (!image) return;
    }

    if (image) {
      this.isZoomed = image;

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

      // set new listeners
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

      // add listeners
      image?.parentElement?.addEventListener('pointerdown', this.onZoomedPointerDown);
      image?.parentElement?.addEventListener('pointermove', this.onZoomedPointerMove);
      image?.parentElement?.addEventListener('pointerup', this.onZoomedPointerUp);

      return;
    }
  }

  zoomIn(): void {
    const highresImage = this.rootElm?.querySelector(
      '[data-vistaview-pos="0"] .vistaview-image-highres'
    ) as HTMLImageElement;
    const width = highresImage.width;
    const height = highresImage.height;

    // store initial width/height if not set
    if (!highresImage.dataset.vistaviewInitialWidth) {
      highresImage.dataset.vistaviewInitialWidth = width.toString();
    }
    if (!highresImage.dataset.vistaviewInitialHeight) {
      highresImage.dataset.vistaviewInitialHeight = height.toString();
    }

    this.setZoomed(highresImage);

    // calculate new width/height
    const maxWidth = (highresImage.naturalWidth || 0) * this.options.maxZoomLevel!;
    if (width && maxWidth && width < maxWidth) {
      const newWidth = Math.min(width + this.options.zoomStep!, maxWidth);
      highresImage!.style.width = `${newWidth}px`;
      const newHeight = (newWidth / width) * height;
      highresImage!.style.height = `${newHeight}px`;
      this.rootElm?.querySelector('button.vistaview-zoom-out-btn')?.removeAttribute('disabled');

      highresImage.dataset.vistaviewCurrentWidth = newWidth.toString();
      highresImage.dataset.vistaviewCurrentHeight = newHeight.toString();

      // set counter zoom panning limits
      if (newWidth === maxWidth) {
        this.rootElm
          ?.querySelector('button.vistaview-zoom-in-btn')
          ?.setAttribute('disabled', 'true');
      }
    }
  }

  zoomOut(): void {
    const highresImage = this.rootElm?.querySelector(
      '[data-vistaview-pos="0"] .vistaview-image-highres'
    ) as HTMLImageElement;
    const width = highresImage.width;
    const height = highresImage.height;

    // get min width
    const minWidth = highresImage.dataset.vistaviewInitialWidth
      ? parseInt(highresImage.dataset.vistaviewInitialWidth)
      : 0;

    const removeZoomOutClass = (e: Event) => {
      if (e.target !== highresImage) return;
      highresImage.classList.remove('vistaview-image--zooming-out');
      highresImage.removeEventListener('transitionend', removeZoomOutClass);
    };
    highresImage.addEventListener('transitionend', removeZoomOutClass);
    highresImage.classList.add('vistaview-image--zooming-out');

    // calculate new width/height
    if (width && minWidth && width > minWidth) {
      const newWidth = Math.max(width - this.options.zoomStep!, minWidth);
      highresImage!.style.width = `${newWidth}px`;

      const newHeight = (newWidth / width) * height;
      highresImage!.style.height = `${newHeight}px`;
      this.rootElm?.querySelector('button.vistaview-zoom-in-btn')?.removeAttribute('disabled');
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
        this.rootElm
          ?.querySelector('button.vistaview-zoom-out-btn')
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
    // TODO, i don't think we need to do anything here for now
  }

  private getImages(activeIndexes: number[]): VistaViewImageIndexed[] {
    return activeIndexes.map((index, i) => {
      const elm = this.elements[index];
      if (elm instanceof HTMLElement) {
        const hasImage = elm.querySelector('img') as HTMLImageElement | undefined;
        const hrefAttr = elm.getAttribute('href') || '';
        const srcAttr = elm.getAttribute('src') || '';
        const src = elm.dataset.vistaviewSrc || hrefAttr || srcAttr || hasImage?.src || '';
        const alt = elm.dataset.vistaviewAlt || elm.getAttribute('alt') || hasImage?.alt || '';
        const thumb = elm.dataset.vistaviewThumb || hasImage?.src || hrefAttr || srcAttr || '';
        return {
          index: activeIndexes[i],
          src,
          alt,
          thumb,
          imageElm: elm instanceof HTMLImageElement ? elm : hasImage,
          anchorElm: elm instanceof HTMLAnchorElement ? elm : undefined,
        };
      } else {
        return { index: activeIndexes[i], ...elm };
      }
    });
  }

  private setInitialDimPos(): void {
    if (!this.rootElm) return;

    // get center elm
    const index = (this.rootElm.querySelector('[data-vistaview-pos="0"]') as HTMLElement)?.dataset
      .vistaviewIndex;
    const centerElm = this.currentImages?.find((img) => img.index === Number(index)) || null;

    if (!centerElm) return;

    const imageProps = centerElm.imageElm ? getElmProperties(centerElm.imageElm) : undefined;
    const anchorProps = centerElm.anchorElm ? getElmProperties(centerElm.anchorElm) : undefined;
    const width = anchorProps?.width || imageProps?.width || 0;
    const height = anchorProps?.height || imageProps?.height || 0;
    const left = (anchorProps?.left || imageProps?.left || 0) + width / 2;
    const top = (anchorProps?.top || imageProps?.top || 0) + height / 2;

    this.rootElm.style.setProperty('--vistaview-container-initial-width', width + 'px');
    this.rootElm.style.setProperty('--vistaview-container-initial-height', height + 'px');
    this.rootElm.style.setProperty('--vistaview-container-initial-top', top + 'px');
    this.rootElm.style.setProperty('--vistaview-container-initial-left', left + 'px');

    this.rootElm.style.setProperty(
      '--vistaview-image-border-radius',
      isNotZeroCssValue(anchorProps?.borderRadius) ||
        isNotZeroCssValue(imageProps?.borderRadius) ||
        '0px'
    );
  }

  private updateZoomButtonsVisibility(): void {
    const highresImage = this.rootElm?.querySelector(
      '[data-vistaview-pos="0"] img.vistaview-image-highres'
    ) as HTMLImageElement;
    if (!highresImage) return;

    const _t = this;
    function onImageLoaded() {
      const zoomInBtn = _t.rootElm?.querySelector(
        'button.vistaview-zoom-in-btn'
      ) as HTMLButtonElement | null;

      const zoomOutBtn = _t.rootElm?.querySelector(
        'button.vistaview-zoom-out-btn'
      ) as HTMLButtonElement | null;

      // Use assigned style width instead of current animated width
      const currentWidth = parseInt(highresImage.style.width) || highresImage.width;
      const maxWidth = highresImage.naturalWidth * _t.options.maxZoomLevel!;
      const canZoom = currentWidth < maxWidth && maxWidth > 0;

      if (zoomInBtn) {
        zoomInBtn.style.display = canZoom ? '' : 'none';
      }
      if (zoomOutBtn) {
        zoomOutBtn.style.display = canZoom ? '' : 'none';
      }
    }

    // Check if zoom is possible: current width < maxWidth (naturalWidth * maxZoomLevel)
    if (highresImage.complete && highresImage.naturalWidth > 0) {
      onImageLoaded();
    } else {
      highresImage.addEventListener('load', onImageLoaded);
    }
  }

  private loadImages() {
    // return;
    if (!this.rootElm) return;

    // set dimension on highres images
    const highresImages = this.rootElm.querySelectorAll(
      '.vistaview-image-highres:not(.vistaview-image-loaded)'
    );

    highresImages.forEach((img, i) => {
      const im = img as HTMLImageElement;

      // set large image initial dimensions
      const el = this.currentImages![i];
      const thumb = el.imageElm;
      const sizes = { w: 0, h: 0 };
      if (thumb) {
        const { width, height } = getFittedSize(thumb as HTMLImageElement);
        sizes.w = Math.min(thumb.width, width);
        sizes.h = Math.min(thumb.height, height);
      }

      const onLoaded = () => {
        // skip if it's an ending image
        // if (im.parentElement?.classList.contains('vistaview-image--ending')) {
        //   return;
        // }

        const setSizes = () => {
          if (sizes.w && sizes.h) {
            im.style.width = `${sizes.w}px`;
            im.style.height = `${sizes.h}px`;
            im.style.setProperty('--vistaview-fitted-width', `${sizes.w}px`);
            im.style.setProperty('--vistaview-fitted-height', `${sizes.h}px`);
          }

          im.classList.add('vistaview-image-loaded');
          im.width = im.naturalWidth;
          im.height = im.naturalHeight;

          setTimeout(() => {
            // skip if it's an ending image
            // if (im.parentElement?.classList.contains('vistaview-image--ending')) {
            //   return;
            // }

            this.setFullSizeImageDim(im);
          }, 100);

          if (img.parentElement?.matches('[data-vistaview-pos="0"]')) {
            this.updateZoomButtonsVisibility();
          }
        };

        // wait for .vistaview--opened exist (animation end)
        if (this.rootElm?.classList.contains('vistaview--opened')) {
          setSizes();
        } else {
          const timeoutId = setInterval(() => {
            if (!this.rootElm?.classList.contains('vistaview--opened')) return;
            clearInterval(timeoutId);
            setSizes();
          }, 50);
        }
      };

      // on loaded
      if (im.complete && im.naturalWidth > 0) {
        onLoaded();
      } else {
        im.onload = onLoaded;
      }
    });
  }

  private setIndexDisplay(): void {
    if (this.elements.length === 1) return;
    this.rootElm!.querySelector('.vistaview-index-display')!.textContent =
      `${this.currentIndex.value! + 1} / ${this.elements.length}`;
  }

  private setCurrentDescription(): void {
    this.rootElm!.querySelector('.vistaview-description')!.textContent =
      (this.currentImages![1] || this.currentImages![0]).alt || '';
  }

  private getCurrentIndexes(currentIndex: number): { images: number[]; positions: number[] } {
    const preloads = this.options.preloads!;
    const total = this.elements.length;

    const images =
      total < 1 || !preloads
        ? [currentIndex]
        : [
            ...new Set([
              ...Array.from(
                { length: preloads },
                (_, i) => (((currentIndex - preloads + i) % total) + total) % total
              ),
              currentIndex,
              ...Array.from({ length: preloads }, (_, i) => (currentIndex + 1 + i) % total),
            ]),
          ];

    const positions =
      total < 1 || !preloads ? [0] : images.map((_, i) => i - Math.floor(images.length / 2));

    return {
      images,
      positions,
    };
  }

  private setKeyboardListeners(): void {
    // keyboard navigation
    this.onKeyDown = (e: KeyboardEvent) => {
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
    window.addEventListener('keydown', this.onKeyDown);
  }

  private setResizeListeners(): void {
    this.onResizeHandler = () => {
      this.setInitialDimPos();
      const highresImages = this.rootElm?.querySelectorAll(
        '.vistaview-image-highres.vistaview-image-loaded'
      );
      highresImages?.forEach((img) => {
        const im = img as HTMLImageElement;
        const { width, height } = getFullSizeDim(im);
        if (im.classList.contains('vistaview-image--zooming')) {
          im.dataset.vistaviewInitialWidth = width.toString();
          im.dataset.vistaviewInitialHeight = height.toString();
        } else {
          im.style.width = `${width}px`;
          im.style.height = `${height}px`;
        }
      });
    };
    window.addEventListener('resize', this.onResizeHandler);
  }

  open(startIndex: number = 0): void {
    if (GlobalVistaState.somethingOpened) {
      console.error('VistaView: another instance is already opened. Returning.');
      return;
    }
    GlobalVistaState.somethingOpened = this;

    this.currentIndex._value = startIndex;

    // create and append the component to body
    document.body.prepend(
      vistaViewComponent({
        controls: this.options.controls,
        isReducedMotion: this.isReducedMotion,
      })
    );

    // set root element
    this.rootElm = document.querySelector('#vistaview-root');
    this.imageContainerElm = this.rootElm?.querySelector('.vistaview-image-container') || null;
    if (!this.rootElm || !this.imageContainerElm) {
      GlobalVistaState.somethingOpened = null;
      throw new Error('Failed to create VistaView element');
    }

    if (!this.options.arrowOnSmallScreens) {
      this.rootElm.classList.add('vistaview-no-arrows-sm');
    }

    // set images and current items
    const { images, positions } = this.getCurrentIndexes(startIndex);
    this.currentImages = this.getImages(images);
    const elms = this.currentImages.map((img, i) => vistaViewItem(img, positions[i]));
    this.currentItems = elms;

    const setupParams = {
      htmlElements: { from: null, to: this.currentItems },
      images: { from: null, to: this.currentImages },
      index: { from: null, to: startIndex },
      via: this.currentIndex.via,
      container: this.imageContainerElm,
      elements: this.elements,
      isReducedMotion: this.isReducedMotion,
      isZoomed: this.isZoomed,
      options: this.options,
    };

    this.userSetup(setupParams);

    // insert
    this.imageContainerElm.innerHTML = '';
    this.currentItems.forEach((elm) => {
      this.imageContainerElm!.appendChild(elm);
    });

    // add class to root when animation is done
    let animationCount = 0;
    this.rootElm.addEventListener('animationend', (e: Event) => {
      if (e.currentTarget !== this.rootElm) return;
      animationCount++;
      // Wait for both animations to complete (vistaview-anim-in and vistaview-pos-in)
      if (animationCount >= 2) {
        this.rootElm?.classList.add('vistaview--opened');
      }
    });

    // set buttons' event listeners
    this.rootElm
      .querySelector('.vistaview-close-btn')
      ?.addEventListener('click', () => this.close());
    this.rootElm
      .querySelector('.vistaview-zoom-in-btn')
      ?.addEventListener('click', () => this.zoomIn());
    this.rootElm
      .querySelector('.vistaview-zoom-out-btn')
      ?.addEventListener('click', () => this.zoomOut());
    this.rootElm
      .querySelector('.vistaview-prev-btn>button')
      ?.addEventListener('click', () => this.prev());
    this.rootElm
      .querySelector('.vistaview-next-btn>button')
      ?.addEventListener('click', () => this.next());

    // set custom controls' event listeners
    [
      ...(this.options.controls!.topLeft || []),
      ...(this.options.controls!.topRight || []),
      ...(this.options.controls!.topCenter || []),
      ...(this.options.controls!.bottomCenter || []),
      ...(this.options.controls!.bottomLeft || []),
      ...(this.options.controls!.bottomRight || []),
    ].forEach((c) => {
      if (typeof c !== 'string') this.customControls[c.name] = c;
    });

    this.rootElm.querySelectorAll(`button[data-vistaview-custom-control]`).forEach((btn) => {
      (btn as HTMLButtonElement).addEventListener('click', (e: MouseEvent) => {
        const control =
          this.customControls[
            (e.currentTarget as HTMLButtonElement).dataset.vistaviewCustomControl!
          ];
        const currentImage = this.currentImages!.find(
          (img) => img.index === this.currentIndex.value
        );
        if (control && currentImage) {
          if (control.onClick.constructor.name === 'AsyncFunction') {
            btn.classList.add('vistaview-button--loading');
            (control.onClick(currentImage) as Promise<void>).finally(() => {
              btn.classList.remove('vistaview-button--loading');
            });
          } else {
            control.onClick(currentImage);
          }
        }
      });
    });

    // add options
    if (this.options.animationDurationBase) {
      this.rootElm.style.setProperty(
        '--vistaview-animation-duration',
        `${this.options.animationDurationBase}`
      );
    }

    if (this.options.initialZIndex !== undefined) {
      this.rootElm.style.setProperty(
        '--vistaview-initial-z-index',
        `${this.options.initialZIndex}`
      );
    }

    // set initial dimension and position
    this.setInitialDimPos();

    // set on event handlers
    this.setResizeListeners();
    if (this.options.keyboardListeners) this.setKeyboardListeners();

    // for single image, hide next/prev buttons and index-display
    if (this.elements.length === 1) {
      this.rootElm.querySelector('.vistaview-prev-btn')?.classList.add('vistaview-ui--none');
      this.rootElm.querySelector('.vistaview-next-btn')?.classList.add('vistaview-ui--none');
      this.rootElm.querySelector('.vistaview-index-display')?.classList.add('vistaview-ui--none');
    }

    this.rootElm && this.rootElm.classList.add('vistaview--initialized');
    this.loadImages();
    this.setCurrentDescription();
    this.setIndexDisplay();

    this.userInit(this);
    this.options.onOpen?.(setupParams);
    this.options.onImageView?.(setupParams);
  }

  async close(wait = true): Promise<void> {
    if (GlobalVistaState.somethingOpened !== this) return;

    if (wait) {
      this.rootElm?.classList.add('vistaview--closing');
      await new Promise<void>((resolve) => {
        let wait: ReturnType<typeof setTimeout>;
        this.rootElm?.addEventListener('transitionend', (e: Event) => {
          if (e.currentTarget !== this.rootElm) return;
          if (wait) clearTimeout(wait);
          wait = setTimeout(() => {
            resolve();
          }, 333);
        });
      });
    }

    // user close
    const closeParams = {
      htmlElements: { from: this.currentItems, to: null },
      images: { from: this.currentImages, to: null },
      index: { from: this.currentIndex.value!, to: null },
      container: this.imageContainerElm!,
      elements: this.elements,
      via: { prev: false, next: false },
      isReducedMotion: this.isReducedMotion,
      isZoomed: this.isZoomed,
      options: this.options,
    };

    this.userClose(this);

    this.options.onClose?.(closeParams);
    document.body.removeChild(this.rootElm!);

    this.currentIndex._value = null;
    this.currentIndex._via = { next: false, prev: false };
    this.rootElm = null;
    this.imageContainerElm = null;
    this.currentImages = null;
    this.currentItems = null;

    if (this.onResizeHandler) {
      window.removeEventListener('resize', this.onResizeHandler);
      this.onResizeHandler = null;
    }

    if (this.onKeyDown) {
      window.removeEventListener('keydown', this.onKeyDown);
      this.onKeyDown = null;
    }

    if (this.onZoomedPointerDown || this.onZoomedPointerMove || this.onZoomedPointerUp) {
      this.setZoomed(false);
      this.onZoomedPointerDown = null;
      this.onZoomedPointerMove = null;
      this.onZoomedPointerUp = null;
    }

    for (const key in this.transitionAbortControllers) {
      this.transitionAbortControllers[key].abort();
    }
    this.transitionAbortControllers = {};

    GlobalVistaState.somethingOpened = null;
  }

  destroy(): void {
    this.close(false);
    if (this.elements instanceof NodeList) {
      this.elements.forEach((el) => {
        el.dataset.vistaviewIndex && delete el.dataset.vistaviewIndex;
        el.removeEventListener('click', this.defaultOnClickHandler);
        el.removeEventListener('pointerup', this.onClickElements);
      });
    }
  }

  view(index: number, state?: { next: boolean; prev: boolean }): void {
    if (GlobalVistaState.somethingOpened !== this) return;

    if (index < 0) index = this.elements.length - 1;
    if (index >= this.elements.length) index = 0;

    // Set current index to view the image
    this.currentIndex.via = state || { next: false, prev: false };
    this.currentIndex.value = index;
  }

  next(): void {
    if (GlobalVistaState.somethingOpened !== this) return;
    this.view(this.currentIndex.value! + 1, { next: true, prev: false });
  }

  prev(): void {
    if (GlobalVistaState.somethingOpened !== this) return;
    this.view(this.currentIndex.value! - 1, { next: false, prev: true });
  }

  getCurrentIndex(): number {
    return GlobalVistaState.somethingOpened === this ? this.currentIndex.value! : -1;
  }
}
