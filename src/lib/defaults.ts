import type {
  VistaViewCloseFunction,
  VistaViewSetupFunction,
  VistaViewTransitionFunction,
} from './types';

import type { VistaView } from './vista-view';

// pointer evvents
let onPointerDown: ((e: PointerEvent) => void) | null = null;
let onPointerMove: ((e: PointerEvent) => void) | null = null;
let onPointerUp: ((e: PointerEvent) => void) | null = null;

// touch actions
function setTouchActions(vistaView: VistaView): void {
  removeTouchActions(vistaView);

  const container = vistaView.imageContainerElm as HTMLElement;
  const totalImage = vistaView.elements.length;
  if (!container) return;

  let initX = 0;
  let initY = 0;
  let lastX = 0;
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
    initTouchTime = Date.now();
  };

  onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vistaView.isZoomed !== false) return;
    if (!isActive) return;
    const diffX = e.pageX - initX;
    const diffY = e.pageY - initY;
    lastX = e.pageX;
    container.style.setProperty('--vistaview-pointer-diff-x', `${diffX}px`);
    container.style.setProperty('--vistaview-pointer-diff-y', `${diffY}px`);
  };

  onPointerUp = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (vistaView.isZoomed !== false) return;
    if (!isActive) return;
    isActive = false;

    const images = Array.from(container.querySelectorAll('.vistaview-item'));

    const distanceX = lastX - initX;
    const timeDiff = Date.now() - initTouchTime;
    const speed = distanceX / timeDiff; // touch speed
    const threshold = vistaView.options.touchSpeedThreshold || 0.7;

    const zeroIndex = images.find(
      (el) => (el as HTMLDivElement).dataset.vistaviewPos === '0'
    ) as HTMLDivElement;
    const index = Number(zeroIndex.dataset.vistaviewIndex);
    const originalReducedMotion = vistaView.isReducedMotion;

    function containerOff() {
      images[0].removeEventListener('transitionend', containerOff);
      container.style.removeProperty('--vistaview-pointer-diff-x');
      container.style.removeProperty('--vistaview-pointer-diff-y');
      images.forEach((elm) => {
        (elm as HTMLDivElement).style.transition = '';
        (elm as HTMLDivElement).style.translate = '';
      });
    }

    function setTranslate(translateX: string) {
      images.forEach((elm) => {
        (elm as HTMLDivElement).style.transition =
          `translate ${vistaView.options.animationDurationBase! * 0.5}ms ease-out`;
        (elm as HTMLDivElement).style.translate = translateX;
      });
    }

    if (speed < -threshold || speed > threshold) {
      // going somewhere
      images[0].addEventListener('transitionend', () => {
        vistaView.isReducedMotion = true;
        containerOff();
        vistaView.view(
          speed < -threshold ? (index + 1) % totalImage : (index - 1 + totalImage) % totalImage,
          {
            next: speed < -threshold,
            prev: speed > threshold,
          }
        );
        vistaView.isReducedMotion = originalReducedMotion;
      });

      setTranslate(speed < -threshold ? '-100%' : '100%');
    } else {
      // not going anywwwhere
      images[0].addEventListener('transitionend', containerOff);
      setTranslate('0%');
    }
  };

  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointerdown', onPointerDown);
}

function removeTouchActions(vistaView: VistaView): void {
  const elm = vistaView.imageContainerElm;
  if (!elm) return;

  if (onPointerMove) elm.removeEventListener('pointermove', onPointerMove);
  if (onPointerUp) elm.removeEventListener('pointerup', onPointerUp);
  if (onPointerDown) elm.removeEventListener('pointerdown', onPointerDown);
}

// default user init
// called when the viewer is opened
// can be used to set up custom controls or other initializations
// for this instance, we setup pointer events
export const defaultInit = (vistaView: VistaView) => {
  setTouchActions(vistaView);
};

// default user setup
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

// default user transition
// performs a simple slide transition between images
export const defaultTransition: VistaViewTransitionFunction = async ({
  htmlElements: { from: htmlFrom, to: htmlTo },
  images: { to: images },
  via: { next, prev },
  container,
  options,
  isReducedMotion,
  // index: { from: fromIndex, to: toIndex },
}) => {
  if (!images) throw new Error('VistaView: images is null in defaultTransition()');

  if (isReducedMotion) {
    // no animation, just swap
    container.innerHTML = '';
    htmlTo!.forEach((elm) => {
      container!.appendChild(elm);
    });
    return images[images.length === 1 ? 0 : Math.floor(images.length / 2)];
  }

  const elms = htmlFrom!.filter((v) => {
    return (
      v.dataset.vistaviewPos === '0' ||
      (next ? v.dataset.vistaviewPos === '1' : v.dataset.vistaviewPos === '-1')
    );
  });

  // non adjacent transition ??
  // const adjacent = Math.abs(toIndex! - fromIndex!) === 1 ||
  //   (fromIndex === 0 && toIndex === images.length -1) ||
  //   (fromIndex === images.length -1 && toIndex === 0);

  await new Promise<number>((r) => {
    function onTransitionEnd() {
      container.innerHTML = '';
      htmlTo!.forEach((elm) => {
        container!.appendChild(elm);
      });
      r(0);
    }

    elms[elms.length - 1].addEventListener('transitionend', onTransitionEnd);
    elms.forEach((elm) => {
      elm.style.transition = `translate ${options.animationDurationBase! * 0.5}ms ease-out`;
      elm.style.translate = next ? '-100%' : prev ? '100%' : '0%';
    });
  });

  return images[images.length === 1 ? 0 : Math.floor(images.length / 2)];
};

// default user close
// resets the styles of the images when the viewer is closed
export const defaultClose: VistaViewCloseFunction = (vistaView) => {
  if (vistaView.elements instanceof NodeList) {
    vistaView.elements.forEach((el) => (el.style.opacity = '1'));
  }
  removeTouchActions(vistaView);
};
