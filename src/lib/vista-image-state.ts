import { clamp, limitPrecision } from './utils';

export type VistaCurrentImage = {
  scale: number;
  stop: boolean;
  translate: { x: number; y: number };
  accumTranslate: { x: number; y: number };
  image: HTMLImageElement | null;
  initial: {
    w: number;
    h: number;
    top: number;
    left: number;
  };
  final: {
    w: number;
    h: number;
  };
  sizes: {
    maxW: number;
    maxH: number;
    minW: number;
    minH: number;
  };
};

export class VistaImageState {
  private current: VistaCurrentImage = {
    image: null,
    scale: 1,
    stop: false,
    translate: { x: 0, y: 0 },
    accumTranslate: { x: 0, y: 0 },
    initial: {
      w: 0,
      h: 0,
      top: 0,
      left: 0,
    },
    final: {
      w: 0,
      h: 0,
    },
    sizes: {
      maxW: 0,
      maxH: 0,
      minW: 0,
      minH: 0,
    },
  };

  private maxZoom: number = 1;
  private centroid: { x: number; y: number } = { x: 0, y: 0 };
  private closeLimit = 0.5;

  setMaxZoom(maxZoom: number) {
    this.maxZoom = maxZoom;
  }

  setInitCentroid(centroid: { x: number; y: number }) {
    this.centroid = centroid;
  }

  constructor(maxZoom: number) {
    this.maxZoom = maxZoom;
    this.centroid = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
  }

  shouldStop(): boolean {
    return this.current.stop;
  }

  hasImage(): boolean {
    return this.current.image !== null;
  }

  newImage({ img }: { img: HTMLImageElement }) {
    const rect = img.getBoundingClientRect();
    this.current = {
      image: img,
      initial: {
        w: rect.width,
        h: rect.height,
        top: rect.top,
        left: rect.left,
      },
      final: {
        w: rect.width,
        h: rect.height,
      },
      stop: false,
      scale: 1,
      translate: { x: 0, y: 0 },
      accumTranslate: { x: 0, y: 0 },
      sizes: {
        maxW: (img?.naturalWidth || 0) * this.maxZoom,
        maxH: (img?.naturalHeight || 0) * this.maxZoom,
        minW: img.width,
        minH: img.height,
      },
    };
  }

  renew() {
    if (!this.current.image) throw new Error('No current image to renew');
    const img = this.current.image;
    const rect = img!.getBoundingClientRect();
    this.current = {
      ...this.current,
      initial: {
        w: rect.width,
        h: rect.height,
        top: rect.top,
        left: rect.left,
      },
      stop: false,
      scale: 1,
      translate: { x: 0, y: 0 },
      sizes: {
        ...this.current.sizes,
        maxW: (img?.naturalWidth || 0) * this.maxZoom,
        maxH: (img?.naturalHeight || 0) * this.maxZoom,
      },
    };
  }

  private calculateTranslate(
    ratio: number,
    width: number,
    height: number,
    centroid: { x: number; y: number }
  ) {
    const c = this.current;
    const initCentroid = this.centroid;
    if (!c.image) throw new Error('No current image to calculate translate');

    // initial.top/left from getBoundingClientRect() already includes visual position
    // so we don't add accumTranslate here (it would double-count)
    const distanceToTop = initCentroid!.y - c.initial.top;
    const distanceToLeft = initCentroid!.x - c.initial.left;

    // Scale distances by ratio to get new distances
    const newDistanceToTop = distanceToTop * ratio;
    const newDistanceToLeft = distanceToLeft * ratio;

    // Calculate new top-left position to keep centroid fixed
    const newTop = initCentroid!.y - newDistanceToTop;
    const newLeft = initCentroid!.x - newDistanceToLeft;

    // Calculate new image center position
    const newCenterX = newLeft + width / 2;
    const newCenterY = newTop + height / 2;

    // Current image center (from getBoundingClientRect)
    const currentCenterX = c.initial.left + c.initial.w / 2;
    const currentCenterY = c.initial.top + c.initial.h / 2;

    // Translation is the difference between new center and current center,
    // plus adjustment for finger movement during gesture
    const translate = {
      x: limitPrecision(newCenterX - currentCenterX + (centroid.x - initCentroid!.x)),
      y: limitPrecision(newCenterY - currentCenterY + (centroid.y - initCentroid!.y)),
    };

    return translate;
  }

  scaleAndMove({ ratio, centroid }: { ratio: number; centroid?: { x: number; y: number } }) {
    const c = this.current;
    if (!c.image) throw new Error('No current image to scale and move');

    // assume doesn't move when centroid not provided
    centroid = centroid || this.centroid;

    const width = c.initial.w * ratio;
    const height = c.initial.h * ratio;

    const finalWidth = clamp(width, c.sizes.minW, c.sizes.maxW);
    const finalHeight = clamp(height, c.sizes.minH, c.sizes.maxH);
    c.final.w = finalWidth;
    c.final.h = finalHeight;

    const finalRatio = width === finalWidth ? ratio : limitPrecision(finalWidth / c.initial.w);

    const translate = this.calculateTranslate(ratio, width, height, centroid);

    // const finalTranslate = translate
    const finalTranslate = this.calculateTranslate(finalRatio, finalWidth, finalHeight, centroid);

    const box = c.image!.getBoundingClientRect();
    const isMin = finalWidth === c.sizes.minW;

    if (!isMin) {
      // calculate limits of finalTranslate
      if (box.top > window.innerHeight / 2) {
        finalTranslate.y = finalTranslate.y - (box.top - window.innerHeight / 2);
      }

      if (box.left > window.innerWidth / 2) {
        finalTranslate.x = finalTranslate.x - (box.left - window.innerWidth / 2);
      }

      if (box.left + box.width < window.innerWidth / 2) {
        finalTranslate.x = finalTranslate.x + (window.innerWidth / 2 - (box.left + box.width));
      }

      if (box.top + box.height < window.innerHeight / 2) {
        finalTranslate.y = finalTranslate.y + (window.innerHeight / 2 - (box.top + box.height));
      }
    }

    c.scale = finalRatio;
    c.translate = isMin ? { x: -c.accumTranslate.x, y: -c.accumTranslate.y } : finalTranslate;

    c.stop = width / c.sizes.minW < this.closeLimit;
    if (c.stop) {
      c.image!.style.opacity = '0.33';
    } else {
      c.image!.style.removeProperty('opacity');
    }

    // set transform
    c.image.style.transform = `translate3d(${translate.x || 0}px, ${translate.y || 0}px, 0px) scale3d(${ratio}, ${ratio}, 1)`;
  }

  private swapDimensions(
    onStopAmination: (c: VistaCurrentImage) => void = (c) => {
      c.image!.classList.add('vistaview-image--touch-zoom');
    }
  ) {
    const c = this.current;
    if (!c.image) throw new Error('No current image to swap dimensions');

    // add class to stop animation
    onStopAmination(c);

    c.initial.w = c.final.w;
    c.initial.h = c.final.h;

    c.scale = 1;
    c.image!.style.width = `${c.initial.w}px`;
    c.image!.style.height = `${c.initial.h}px`;

    c.accumTranslate.x += c.translate.x;
    c.accumTranslate.y += c.translate.y;
    c.image!.style.translate = `calc(-50% + ${c.accumTranslate.x}px) calc(-50% + ${c.accumTranslate.y}px)`;
    c.image!.style.transform = `translate3d(0px, 0px, 0px) scale3d(1, 1, 1)`;
    c.translate = { x: 0, y: 0 };
  }

  stabilizeProps(
    onAnimateTransform: (c: VistaCurrentImage) => void = (c) => {
      c.image!.classList.remove('vistaview-image--touch-zoom');
    }
  ) {
    const c = this.current;
    if (!c.image) throw new Error('No current image to stabilize props');

    const lastTransform = c.image!.style.transform;
    const nextTransform = `translate3d(${c.translate.x}px, ${c.translate.y}px, 0px) scale3d(${c.scale}, ${c.scale}, 1)`;

    // animate when transform changes
    if (lastTransform !== nextTransform) {
      onAnimateTransform(c);
      c.image!.addEventListener(
        'transitionend',
        () => {
          this.swapDimensions();
        },
        { once: true }
      );
      c.image!.style.transform = nextTransform;
    } else {
      c.image!.style.transform = nextTransform;
      this.swapDimensions();
    }
  }

  close({
    onClose,
    onAnimateZoomOut = (c) => {
      c.image!.classList.add('vistaview-image--touch-zoom-out');
    },
  }: {
    onClose?: () => void;
    onAnimateZoomOut?: (c: VistaCurrentImage) => void;
  }) {
    const c = this.current;
    if (!c.image) throw new Error('No current image to close');

    const rect = c.image!.getBoundingClientRect();
    c.image!.style.width = rect.width + 'px';
    c.image!.style.height = rect.height + 'px';
    c.image!.style.transform = c.image!.style.transform.replace(
      /scale3d\([0-9.]+, [0-9.]+, 1\)/,
      'scale3d(1, 1, 1)'
    );

    requestAnimationFrame(() => {
      onAnimateZoomOut(c);
      c.image!.style.opacity = '1';
      c.image!.style.width = c.image!.style.getPropertyValue('--vistaview-fitted-width');
      c.image!.style.height = c.image!.style.getPropertyValue('--vistaview-fitted-height');
      c.image!.style.transform = `translate3d(0px, 0px, 0px) scale3d(1, 1, 1)`;
      c.image!.addEventListener(
        'transitionend',
        () => {
          if (onClose) onClose();
          c.image = null;
        },
        { once: true }
      );
    });
  }
}
