import type {
  VistaViewCloseFunction,
  VistaViewSetupFunction,
  VistaViewTransitionFunction,
} from './types';

import type { VistaView } from './vista-view';
import { VistaViewTransitionAbortedError } from './vista-view';

// pointer evvents
let onPointerDown: ((e: PointerEvent) => void) | null = null;
let onPointerMove: ((e: PointerEvent) => void) | null = null;
let onPointerUp: ((e: PointerEvent) => void) | null = null;
let onPointerCancel: ((e: PointerEvent) => void) | null = null;

// touch actions
export function setTouchActions(vistaView: VistaView): void {
  removeTouchActions(vistaView);

  const container = vistaView.imageContainerElm as HTMLElement;
  const totalImage = vistaView.elements.length;
  if (!container) return;

  let initX = 0;
  let initY = 0;
  let lastX = 0;
  let lastY = 0;
  let horizontal: boolean | null = null;
  let initTouchTime = 0;
  let isActive = false;

  onPointerDown = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vistaView.isZoomed !== false) return;
    isActive = true;
    initX = e.pageX;
    initY = e.pageY;
    lastX = e.pageX;
    lastY = e.pageY;
    initTouchTime = Date.now();
    horizontal = null;
    // Capture pointer for reliable tracking on mobile
    container.setPointerCapture(e.pointerId);
  };

  onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vistaView.isZoomed !== false) return;
    if (!isActive) return;
    const diffX = e.pageX - initX;
    const diffY = e.pageY - initY;
    lastX = e.pageX;
    lastY = e.pageY;
    if (Math.abs(diffX) >= Math.abs(diffY) && (horizontal === null || horizontal === true)) {
      container.style.setProperty('--vistaview-pointer-diff-x', `${diffX}px`);
      horizontal = true;
    } else if (Math.abs(diffY) > Math.abs(diffX) && (horizontal === null || horizontal === false)) {
      container.style.setProperty('--vistaview-pointer-diff-y', `${diffY}px`);
      horizontal = false;
    }
  };

  onPointerCancel = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Release pointer capture
    container.releasePointerCapture(e.pointerId);
    if (vistaView.isZoomed !== false) return;
    if (!isActive) return;
    isActive = false;
    horizontal = null;
    const images = Array.from(container.querySelectorAll('.vistaview-item'));
    container.style.removeProperty('--vistaview-pointer-diff-x');
    container.style.removeProperty('--vistaview-pointer-diff-y');
    images.forEach((elm) => {
      (elm as HTMLDivElement).style.transition = '';
      (elm as HTMLDivElement).style.translate = '';
    });
  };

  onPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Release pointer capture
    container.releasePointerCapture(e.pointerId);
    if (vistaView.isZoomed !== false) return;
    if (!isActive) return;
    isActive = false;

    const images = Array.from(container.querySelectorAll('.vistaview-item'));

    const distanceX = lastX - initX;
    const distanceY = lastY - initY;
    const timeDiff = Date.now() - initTouchTime;
    const speedX = distanceX / timeDiff; // touch speed
    const speedY = distanceY / timeDiff; // touch speed
    const threshold = vistaView.options.touchSpeedThreshold || 0.5;
    // const threshold = 0.5

    const zeroIndex = images.find(
      (el) => (el as HTMLDivElement).dataset.vistaviewPos === '0'
    ) as HTMLDivElement;
    const index = Number(zeroIndex.dataset.vistaviewIndex);

    function containerOff() {
      images[0].removeEventListener('transitionend', containerOff);
      container.style.removeProperty('--vistaview-pointer-diff-x');
      container.style.removeProperty('--vistaview-pointer-diff-y');
      images.forEach((elm) => {
        (elm as HTMLDivElement).style.transition = '';
        (elm as HTMLDivElement).style.translate = '';
      });
    }

    function setTranslate(translateX: string = '0%', translateY: string = '0%') {
      images.forEach((elm) => {
        (elm as HTMLDivElement).style.transition =
          `translate ${vistaView.options.animationDurationBase! * 0.5}ms ease-out`;
        (elm as HTMLDivElement).style.translate = `${translateX} ${translateY}`;
      });
    }

    if (speedX < -threshold || speedX > threshold) {
      // going somewhere
      function gotoNewImage() {
        images[0].removeEventListener('transitionend', gotoNewImage);

        // just be, but with timeout to allow transitionend to complete
        setTimeout(() => {
          // turn on reduced motion for the transition
          const originalReducedMotion = vistaView.isReducedMotion;
          vistaView.isReducedMotion = true;
          containerOff();
          vistaView.view(
            speedX < -threshold ? (index + 1) % totalImage : (index - 1 + totalImage) % totalImage,
            {
              next: speedX < -threshold,
              prev: speedX > threshold,
            }
          );
          vistaView.isReducedMotion = originalReducedMotion;
        }, 100);
      }
      setTranslate(speedX < -threshold ? '-100%' : '100%');
      images[0].addEventListener('transitionend', gotoNewImage);
    } else if (speedY < -threshold || speedY > threshold) {
      // y detected, close
      vistaView.close();
      setTranslate('0%', '0%');
    } else {
      // not going anywwwhere
      images[0].addEventListener('transitionend', containerOff);
      setTranslate('0%');
      // do zoom
      speedX === 0 && speedY === 0 && vistaView.zoomIn();
    }
  };

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointercancel', onPointerCancel);
}

export function removeTouchActions(vistaView: VistaView): void {
  const elm = vistaView.imageContainerElm;
  if (!elm) return;

  if (onPointerMove) elm.removeEventListener('pointermove', onPointerMove);
  if (onPointerUp) elm.removeEventListener('pointerup', onPointerUp);
  if (onPointerDown) elm.removeEventListener('pointerdown', onPointerDown);
  if (onPointerCancel) elm.removeEventListener('pointercancel', onPointerCancel);
}

// default init
// called when the viewer is opened
// can be used to set up custom controls or other initializations
// for this instance, we setup pointer events
export const defaultInit = (vistaView: VistaView) => {
  setTouchActions(vistaView);
};

// default setup
// sets up the initial positions and styles of the images
// when the viewer is opened or when navigating between images
export const defaultSetup: VistaViewSetupFunction = ({
  htmlElements: { to },
  index: { to: indexTo },
  elements,
}) => {
  // set opacity of the current selected image
  if (elements instanceof NodeList && indexTo !== null) {
    elements.forEach((el) => (el.style.opacity = '1'));
    elements[indexTo]!.style.opacity = '0';
  }

  // set indexes and positions
  to &&
    to.forEach((elm) => {
      const pos = Number(elm.dataset.vistaviewPos);
      if (pos !== 0) {
        elm.style.zIndex = '1';
        elm.style.left = 100 * pos + '%';
      } else {
        elm.style.zIndex = '2';
      }
    });
};

// default transition
// performs a simple slide transition between images
export const defaultTransition: VistaViewTransitionFunction = async (
  {
    htmlElements: { from: htmlFrom, to: htmlTo },
    images: { to: images },
    via: { next, prev },
    options,
    isReducedMotion,
    // index: { from: fromIndex, to: toIndex },
  },
  abortSignal
) => {
  // non adjacent transition ??
  // const adjacent = Math.abs(toIndex! - fromIndex!) === 1 ||
  //   (fromIndex === 0 && toIndex === images.length -1) ||
  //   (fromIndex === images.length -1 && toIndex === 0);

  if (!images) throw new Error('VistaView: images is null in defaultTransition()');

  if (isReducedMotion) {
    // no animation, just swap
    return;
  }

  const elms = htmlFrom!.filter((v) => {
    return (
      v.dataset.vistaviewPos === '0' ||
      (next ? v.dataset.vistaviewPos === '1' : v.dataset.vistaviewPos === '-1')
    );
  });

  await new Promise<number>((r, j) => {
    let transitionEnded = 0;

    if (abortSignal.aborted) {
      j(new VistaViewTransitionAbortedError('Transition aborted'));
      return;
    }

    const onTransitionEnd = (e: Event) => {
      if (abortSignal.aborted) {
        return j(new VistaViewTransitionAbortedError('Transition aborted'));
      }

      e.currentTarget!.removeEventListener('transitionend', onTransitionEnd);
      transitionEnded++;
      if (transitionEnded < elms.length) return;

      // find vistaViewIndex for elm with zero pos
      const zeroPos = htmlTo?.find((elm) => elm.dataset.vistaviewPos === '0');
      const vistaViewIndex = zeroPos ? Number(zeroPos.dataset.vistaviewIndex) : 0;

      // find current image element with the same index
      const currentElm = elms.find((elm) => Number(elm.dataset.vistaviewIndex) === vistaViewIndex);
      const currentImage = currentElm?.querySelector(
        '.vistaview-image-highres'
      ) as HTMLImageElement;

      // the image is non-existent, return immediately
      // this is probably because rapid navigation, so just return
      if (!currentImage) {
        // but the error needs to be thrown
        return j(new Error('current image element not found'));
      }

      // if the image is not loaded yet, return immediately
      if (!currentImage.classList.contains('vistaview-image-loaded')) {
        return r(0);
      }

      // the image is settled, return immediately
      if (currentImage.classList.contains('vistaview-image-settled')) {
        return r(0);
      }

      // wait for the image to have .vistaview-image-settled
      let limit = 0;
      const interval = setInterval(() => {
        if (abortSignal.aborted) {
          clearInterval(interval);
          return j(new VistaViewTransitionAbortedError('Transition aborted'));
        }

        limit++;

        // wait for max time
        if (limit > (options.animationDurationBase! / 20) * 1.5) {
          clearInterval(interval);
          return r(0);
        }

        if (currentImage.classList.contains('vistaview-image-settled')) {
          zeroPos?.classList.add('vistaview-image-settled');
          clearInterval(interval);
          return r(0);
        }
      }, 20);
    };

    elms.forEach((elm) => {
      elm.style.transition = `translate ${options.animationDurationBase! * 0.5}ms ease-out`;
      elm.style.translate = next ? '-100%' : prev ? '100%' : '0%';
      elm.addEventListener('transitionend', onTransitionEnd);
    });
  });
};

// default close
// resets the styles of the images when the viewer is closed
// and removes pointer event listeners
export const defaultClose: VistaViewCloseFunction = (vistaView) => {
  if (vistaView.elements instanceof NodeList) {
    vistaView.elements.forEach((el) => (el.style.opacity = '1'));
  }
  removeTouchActions(vistaView);
};
