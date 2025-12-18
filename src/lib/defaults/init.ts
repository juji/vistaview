import type { VistaExternalPointerListenerArgs } from '../types';
import type { VistaView } from '../vista-view';

// run on initialization, when we open the viewer
export function init(vistaView: VistaView) {
  // setup container width and position
  const preloads = vistaView.options.preloads!;
  vistaView.imageContainer!.style.width = `${(preloads * 2 + 1) * 100}vw`;
  vistaView.imageContainer!.style.left = `-${preloads * 100}vw`;
  vistaView.imageContainer!.style.display = 'flex';

  registerPointerListener(vistaView);
}

// register external pointer listener
function registerPointerListener(vistaView: VistaView) {
  let startX = 0;
  let currentX = 0;
  let startY = 0;
  let currentY = 0;
  let axis: 'x' | 'y' | null = null;

  // external pointer listener
  vistaView.registerPointerListener((e: VistaExternalPointerListenerArgs) => {
    // return if event has internal execution
    if (e.hasInternalExecution) return;

    // we only deal with pointers of length 1 here
    if (e.pointers.length > 1) return;

    // on down, record start positions
    if (e.event === 'down') {
      startX = e.pointer.x;
      currentX = startX;
      startY = e.pointer.y;
      currentY = startY;
    }

    // on move, calculate deltas and translate image container
    if (e.event === 'move') {
      currentX = e.pointer.x;
      currentY = e.pointer.y;

      const deltaX = currentX - startX;
      const deltaY = currentY - startY;

      if ((!axis && Math.abs(deltaY) > Math.abs(deltaX)) || axis === 'y') {
        const percentY = (deltaY / window.innerHeight) * 100;
        vistaView.imageContainer!.style.transition = 'none';
        vistaView.imageContainer!.style.transform = `translateY(${percentY}vh)`;
        axis = 'y';
      } else if ((!axis && Math.abs(deltaX) > Math.abs(deltaY)) || axis === 'x') {
        const percentX = (deltaX / window.innerWidth) * 100;
        vistaView.imageContainer!.style.transition = 'none';
        vistaView.imageContainer!.style.transform = `translateX(${percentX}vw)`;
        axis = 'x';
      }
    }

    // on up or cancel, determine if we should close or reset position
    if (e.event === 'up' || e.event === 'cancel') {
      function resetPosition(transform: string) {
        vistaView.imageContainer?.addEventListener('transitionend', function handler() {
          vistaView.imageContainer?.removeEventListener('transitionend', handler);
          vistaView.imageContainer!.style.transition = '';
          vistaView.imageContainer!.style.transform = '';
        });
        vistaView.imageContainer!.style.transition = 'transform 222ms ease';
        vistaView.imageContainer!.style.transform = transform;
      }

      // handle vertical swipe
      if (axis === 'y') {
        const deltaY = currentY - startY;
        const movement = e.pointer.movementY;
        const threshold = 8; // px

        // reset transition
        vistaView.imageContainer!.style.transition = '';

        // swipe down
        if (deltaY > 0 && Math.abs(movement) > threshold) {
          vistaView.imageContainer!.style.transition = 'transform 222ms ease';
          vistaView.imageContainer!.style.transform = `translateY(0vh)`;
          vistaView.close();
        }

        // swipe up
        else if (deltaY < 0 && Math.abs(movement) > threshold) {
          vistaView.imageContainer!.style.transition = 'transform 222ms ease';
          vistaView.imageContainer!.style.transform = `translateY(0vh)`;
          vistaView.close();
        }

        // reset position
        else {
          resetPosition(`translateY(0vh)`);
        }
      }

      // handle horizontal swipe
      if (axis === 'x') {
        const deltaX = currentX - startX;
        const movement = e.pointer.movementX;
        const threshold = 8; // px

        vistaView.imageContainer!.style.transition = '';

        // swipe right
        if (deltaX > 0 && Math.abs(movement) > threshold) {
          vistaView.prev();
        }

        // swipe left
        else if (deltaX < 0 && Math.abs(movement) > threshold) {
          vistaView.next();
        }

        // reset position
        else {
          resetPosition(`translateX(0vw)`);
        }
      }

      // reset
      axis = null;
    }
  });
}
