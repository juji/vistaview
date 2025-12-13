import { vistaViewComponent, vistaViewItem, vistaViewDownload } from './components';

import {
  getElmProperties,
  getFittedSize,
  getFullSizeDim,
  getMaxMinZoomLevels,
  isNotZeroCssValue,
  clamp,
} from './utils';

import { Throttle } from './throttle';

import type {
  VistaViewCloseFunction,
  VistaViewSetupFunction,
  VistaViewTransitionFunction,
  VistaViewCustomControl,
  VistaViewImage,
  VistaViewImageIndexed,
  VistaViewOptions,
  VistaViewInitFunction,
  VistaViewCurrentImage,
} from './types';

import { defaultSetup, defaultTransition, defaultClose, defaultInit } from './defaults';
import { VistaViewPointers, type VistaViewPointerListenerArgs } from './pointers';

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

  private throttle = new Throttle();

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

  // private onZoomedPointerDown: ((e: PointerEvent) => void) | null = null;
  // private onZoomedPointerMove: ((e: PointerEvent) => void) | null = null;
  // private onZoomedPointerUp: ((e: PointerEvent) => void) | null = null;
  private onZoomedPointerListener: null | ((e: VistaViewPointerListenerArgs) => void) = null;

  private transitionAbortControllers: { [key: string]: AbortController } = {};
  private pointers: VistaViewPointers | null = null;

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
      vistaView: this,
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

        // this doesn't work.
        // some elements, while loading don't have width and height
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

    let raf: number | null = null;

    // this needs to be first
    // basically remove event listeners from previous zoomed image
    if (this.isZoomed) {
      if (raf) cancelAnimationFrame(raf);
      let img = this.isZoomed;
      img.classList.remove('vistaview-image--zooming');

      if (this.onZoomedPointerListener) {
        this.pointers?.removeEventListener(this.onZoomedPointerListener);
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

      // image.classList.add('vistaview-image--zooming');

      image?.style.setProperty('--pointer-diff-x', `0px`);
      image?.style.setProperty('--pointer-diff-y', `0px`);

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let diffX = 0;
      let diffY = 0;
      let localDiffX = 0;
      let localDiffY = 0;
      let initTime = 0;
      let speedScale = 15;
      let centeringDamping = 5;
      let speedDecay = 0.1;

      function animateTranslation({ speedX, speedY }: { speedX: number; speedY: number }) {
        raf = requestAnimationFrame(() => {
          if (Math.abs(speedX) < 0.01 && Math.abs(speedY) < 0.01) {
            return;
          }

          const img = image as HTMLImageElement;
          const centerX = window.innerWidth / 2;
          const centerY = window.innerHeight / 2;
          const bounds = img.getBoundingClientRect();
          const isUp = bounds.bottom < centerY;
          const isDown = bounds.top > centerY;
          const isLeft = bounds.right < centerX;
          const isRight = bounds.left > centerX;

          diffX += speedX;
          diffY += speedY;
          if (isUp) {
            diffY += (centerY - bounds.bottom) / centeringDamping;
          }
          if (isDown) {
            diffY -= (bounds.top - centerY) / centeringDamping;
          }
          if (isLeft) {
            diffX += (centerX - bounds.right) / centeringDamping;
          }
          if (isRight) {
            diffX -= (bounds.left - centerX) / centeringDamping;
          }
          img?.style.setProperty('--pointer-diff-x', `${diffX}px`);
          img?.style.setProperty('--pointer-diff-y', `${diffY}px`);
          animateTranslation({
            speedX: speedX * (1 - speedDecay),
            speedY: speedY * (1 - speedDecay),
          });
        });
      }

      // set new listeners
      const onZoomedPointerDown = (e: PointerEvent) => {
        if (raf) cancelAnimationFrame(raf);
        e.preventDefault();
        e.stopPropagation();
        isDragging = true;
        startX = e.pageX;
        startY = e.pageY;
        initTime = performance.now();
        image!.setPointerCapture(e.pointerId);
      };

      const onZoomedPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        e.preventDefault();
        localDiffX = e.pageX - startX;
        localDiffY = e.pageY - startY;

        image?.style.setProperty('--pointer-diff-x', `${localDiffX + diffX}px`);
        image?.style.setProperty('--pointer-diff-y', `${localDiffY + diffY}px`);
      };

      const onZoomedPointerUp = (e: PointerEvent) => {
        isDragging = false;
        image!.releasePointerCapture(e.pointerId);
        diffX += localDiffX;
        diffY += localDiffY;

        if (localDiffX === 0 && localDiffY === 0) {
          this.zoomIn();
        } else {
          let timeDiff = performance.now() - initTime;
          if (timeDiff === 0) return;
          let speedY = (e.pageY - startY) / timeDiff;
          let speedX = (e.pageX - startX) / timeDiff;
          animateTranslation({ speedX: speedX * speedScale, speedY: speedY * speedScale });
        }

        localDiffX = 0;
        localDiffY = 0;
      };

      this.onZoomedPointerListener = (e: VistaViewPointerListenerArgs) => {
        if (!this.isZoomed || this.isZoomed !== image) return;
        if (e.pointers.length > 1) return; // ignore multi-touch
        switch (e.event) {
          case 'down':
            onZoomedPointerDown(e.domEvent);
            return;
          case 'move':
            onZoomedPointerMove(e.domEvent);
            return;
          case 'up':
            onZoomedPointerUp(e.domEvent);
            return;
        }
      };

      // add listeners
      // image?.parentElement?.addEventListener('pointerdown', this.onZoomedPointerDown);
      // image?.parentElement?.addEventListener('pointermove', this.onZoomedPointerMove);
      // image?.parentElement?.addEventListener('pointerup', this.onZoomedPointerUp);
      this.pointers?.addEventListener(this.onZoomedPointerListener);

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
      pointerDiffX = clamp(pointerDiffX, minDiffX, maxDiffX);
      pointerDiffY = clamp(pointerDiffY, minDiffY, maxDiffY);

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
        im.onerror = () => {
          console.error('VistaView: failed to load image ' + im.src);
          im.parentElement?.classList.add('vistaview-image-load-failed');
        };
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

  private setSize({
    image,
    scale,
    translate,
  }: {
    image: HTMLImageElement;
    translate?: { x: number; y: number };
    scale: number;
  }): void {
    if (translate) {
      image.style.transform = `translate3d(${translate.x || 0}px, ${translate.y || 0}px, 0px) scale3d(${scale}, ${scale}, 1)`;
    } else {
      image.style.transform = `translate3d(0px, 0px, 0px) scale3d(${scale}, ${scale}, 1)`;
    }
  }

  // Calculate displacement to keep centroid point fixed (scale around point)
  private calculateTranslate(
    currentImage: VistaViewCurrentImage,
    ratio: number,
    width: number,
    height: number,
    newCentroid: { x: number; y: number }
  ) {
    // initial.top/left from getBoundingClientRect() already includes visual position
    // so we don't add accumTranslate here (it would double-count)
    const distanceToTop = currentImage.centroid!.y - currentImage.initial.top;
    const distanceToLeft = currentImage.centroid!.x - currentImage.initial.left;

    // Scale distances by ratio to get new distances
    const newDistanceToTop = distanceToTop * ratio;
    const newDistanceToLeft = distanceToLeft * ratio;

    // Calculate new top-left position to keep centroid fixed
    const newTop = currentImage.centroid!.y - newDistanceToTop;
    const newLeft = currentImage.centroid!.x - newDistanceToLeft;

    // Calculate new image center position
    const newCenterX = newLeft + width / 2;
    const newCenterY = newTop + height / 2;

    // Current image center (from getBoundingClientRect)
    const currentCenterX = currentImage.initial.left + currentImage.initial.w / 2;
    const currentCenterY = currentImage.initial.top + currentImage.initial.h / 2;

    // Translation is the difference between new center and current center,
    // plus adjustment for finger movement during gesture
    const translate = {
      x:
        Math.round(
          (newCenterX - currentCenterX + (newCentroid.x - currentImage.centroid!.x)) * 100
        ) / 100,
      y:
        Math.round(
          (newCenterY - currentCenterY + (newCentroid.y - currentImage.centroid!.y)) * 100
        ) / 100,
    };

    return translate;
  }

  private setPointerListener = () => {
    let lastDown: number | null = null;
    let lastDistance = 0;
    let lastRatio = 0;

    let currentImage: VistaViewCurrentImage = {
      centroid: null,
      scale: 1,
      stop: false,
      translate: { x: 0, y: 0 },
      accumTranslate: { x: 0, y: 0 },
      image: null,
      initial: {
        w: 0,
        h: 0,
        top: 0,
        left: 0,
      },
      sizes: {
        maxW: 0,
        maxH: 0,
        minW: 0,
        minH: 0,
      },
    };

    return (e: VistaViewPointerListenerArgs) => {
      if (!this.pointers) return;
      if (!this.rootElm) return;

      if (e.event === 'down') {
        if (e.pointers.length === 1) {
          lastDown = performance.now();
        }

        if (e.pointers.length >= 2) {
          lastDown = null;
          lastDistance = this.pointers.getPointerDistance(e.pointers[0], e.pointers[1]);
          const image = this.rootElm.querySelector(
            '[data-vistaview-pos="0"] .vistaview-image-highres'
          ) as HTMLImageElement;
          if (!image) return;

          image.classList.add('vistaview-image--touch-zoom');

          const rect = image.getBoundingClientRect();
          currentImage = {
            image: image,
            centroid: this.pointers.getCentroid(),
            initial: {
              w: rect.width,
              h: rect.height,
              top: rect.top,
              left: rect.left,
            },
            stop: false,
            scale: 1,
            translate: { x: 0, y: 0 },
            accumTranslate: currentImage.accumTranslate,
            sizes: {
              maxW: image ? (image?.naturalWidth || 0) * this.options.maxZoomLevel! : 0,
              maxH: image ? (image?.naturalHeight || 0) * this.options.maxZoomLevel! : 0,
              minW: currentImage.sizes.minW || image.width,
              minH: currentImage.sizes.minH || image.height,
            },
          };
        }
      } else if (e.event === 'move') {
        if (e.pointers.length >= 2) {
          if (!currentImage.image) return;
          if (!currentImage.centroid) return;

          const distance = this.pointers.getPointerDistance(e.pointers[0], e.pointers[1]);
          const ratio = Math.round((distance / lastDistance) * 100) / 100;

          // avoid excessive calls
          if (ratio === lastRatio) return;

          lastRatio = ratio;

          const width = currentImage.initial.w * ratio;
          const height = currentImage.initial.h * ratio;

          const finalWidth = clamp(width, currentImage.sizes.minW, currentImage.sizes.maxW);
          const finalHeight = clamp(height, currentImage.sizes.minH, currentImage.sizes.maxH);

          const finalRatio =
            width === finalWidth
              ? ratio
              : Math.round((finalWidth / currentImage.initial.w) * 100) / 100;

          // calculate translate, get current centroid
          const newCentroid = this.pointers!.getCentroid()!;

          const translate = this.calculateTranslate(
            currentImage,
            ratio,
            width,
            height,
            newCentroid
          );

          // const finalTranslate = translate
          const finalTranslate = this.calculateTranslate(
            currentImage,
            finalRatio,
            finalWidth,
            finalHeight,
            newCentroid
          );

          const box = currentImage.image.getBoundingClientRect();
          const isMin =
            finalWidth === currentImage.sizes.minW && finalHeight === currentImage.sizes.minH;

          if (!isMin) {
            // calculate limits of finalTranslate
            if (box.top > window.innerHeight / 2) {
              finalTranslate.y = finalTranslate.y - (box.top - window.innerHeight / 2);
            }

            if (box.left > window.innerWidth / 2) {
              finalTranslate.x = finalTranslate.x - (box.left - window.innerWidth / 2);
            }

            if (box.left + box.width < window.innerWidth / 2) {
              finalTranslate.x =
                finalTranslate.x + (window.innerWidth / 2 - (box.left + box.width));
            }

            if (box.top + box.height < window.innerHeight / 2) {
              finalTranslate.y =
                finalTranslate.y + (window.innerHeight / 2 - (box.top + box.height));
            }
          }

          currentImage.scale = finalRatio;

          currentImage.translate = isMin
            ? { x: -currentImage.accumTranslate.x, y: -currentImage.accumTranslate.y }
            : finalTranslate;

          currentImage.stop = width / currentImage.sizes.minW < 0.5;

          if (currentImage.stop) {
            currentImage.image.style.opacity = '0.33';
          } else {
            currentImage.image.style.removeProperty('opacity');
          }

          this.setSize({
            image: currentImage.image,
            scale: ratio,
            translate,
          });
        }
      } else if (e.event === 'up') {
        if (e.pointers.length === 1 && lastDown) {
          // const time = lastDown ? performance.now() - lastDown : null;
          // if(time !== null && time < 300) {
          //   // treat as click
          //   this.zoomIn();
          // }
        }

        if (e.lastPointerLen >= 2) {
          if (currentImage.image) {
            if (currentImage.stop) {
              this.throttle.exec(() => {
                const rect = currentImage.image!.getBoundingClientRect();
                currentImage.image!.style.width = rect.width + 'px';
                currentImage.image!.style.height = rect.height + 'px';
                currentImage.image!.style.transform = currentImage.image!.style.transform.replace(
                  /scale3d\([0-9.]+, [0-9.]+, 1\)/,
                  'scale3d(1, 1, 1)'
                );

                requestAnimationFrame(() => {
                  currentImage.image!.classList.add('vistaview-image--touch-zoom-out');
                  currentImage.image!.style.opacity = '1';
                  currentImage.image!.style.width = currentImage.image!.style.getPropertyValue(
                    '--vistaview-fitted-width'
                  );
                  currentImage.image!.style.height = currentImage.image!.style.getPropertyValue(
                    '--vistaview-fitted-height'
                  );
                  currentImage.image!.style.transform = `translate3d(0px, 0px, 0px) scale3d(1, 1, 1)`;
                  currentImage.image!.addEventListener(
                    'transitionend',
                    () => {
                      this.close();
                      currentImage.image = null;
                    },
                    { once: true }
                  );
                });
              }, 'closing after touch zoom out');
            } else {
              this.throttle.exec(() => {
                function swapDimensions() {
                  // reset last ratio
                  lastRatio = 0;

                  // add class to stop animation
                  currentImage.image!.classList.add('vistaview-image--touch-zoom');

                  // requestAnimationFrame(() => {
                  currentImage.initial.w = currentImage.initial.w * currentImage.scale;
                  currentImage.initial.h = currentImage.initial.h * currentImage.scale;

                  // limit dimesion
                  currentImage.initial.w = clamp(
                    currentImage.initial.w,
                    currentImage.sizes.minW,
                    currentImage.sizes.maxW
                  );
                  currentImage.initial.h = clamp(
                    currentImage.initial.h,
                    currentImage.sizes.minH,
                    currentImage.sizes.maxH
                  );

                  currentImage.scale = 1;
                  currentImage.centroid = null;
                  currentImage.image!.style.width = `${currentImage.initial.w}px`;
                  currentImage.image!.style.height = `${currentImage.initial.h}px`;

                  currentImage.accumTranslate.x += currentImage.translate.x;
                  currentImage.accumTranslate.y += currentImage.translate.y;
                  currentImage.image!.style.translate = `calc(-50% + ${currentImage.accumTranslate.x}px) calc(-50% + ${currentImage.accumTranslate.y}px)`;
                  currentImage.image!.style.transform = `translate3d(0px, 0px, 0px) scale3d(1, 1, 1)`;
                  currentImage.translate = { x: 0, y: 0 };
                  // currentImage.image!.classList.remove('vistaview-image--touch-zoom');
                  // });
                }

                const lastTransform = currentImage.image!.style.transform;
                const nextTransform = `translate3d(${currentImage.translate.x}px, ${currentImage.translate.y}px, 0px) scale3d(${currentImage.scale}, ${currentImage.scale}, 1)`;

                // animate when transform changes
                if (lastTransform !== nextTransform) {
                  currentImage.image!.classList.remove('vistaview-image--touch-zoom');
                  currentImage.image!.addEventListener(
                    'transitionend',
                    () => {
                      swapDimensions();
                    },
                    { once: true }
                  );
                  currentImage.image!.style.transform = nextTransform;
                } else {
                  currentImage.image!.style.transform = nextTransform;
                  swapDimensions();
                }
              }, 'resetting after touch zoom in');
            }
          }
        }
      } else if (e.event === 'cancel') {
        // this.pointers.onPointerCancel(e.originalEvent);
      }
    };
  };

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
      vistaView: this,
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

    // set pointer events
    this.pointers = new VistaViewPointers(this.rootElm, [this.setPointerListener()]);

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
      via: { prev: false, next: false },
      vistaView: this,
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

    if (this.onZoomedPointerListener) {
      this.setZoomed(false);
      this.onZoomedPointerListener = null;
    }

    for (const key in this.transitionAbortControllers) {
      this.transitionAbortControllers[key].abort();
    }
    this.transitionAbortControllers = {};

    this.pointers?.removeListeners();
    this.pointers = null;

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
