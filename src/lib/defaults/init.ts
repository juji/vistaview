import type { VistaExternalPointerListenerArgs } from '../types';
import type { VistaView } from '../vista-view';

// run on initialization, when we initiate the class
export function init(vistaView: VistaView) {
  registerPointerListener(vistaView);
}

// register external pointer listener
function registerPointerListener(vistaView: VistaView) {
  let start = { x: 0, y: 0 };
  let current = { x: 0, y: 0 };
  let axis: 'x' | 'y' | null = null;

  // external pointer listener
  vistaView.registerPointerListener((e: VistaExternalPointerListenerArgs) => {
    // return if event has internal execution
    if (e.hasInternalExecution) return;

    // we only deal with pointers of length 1 here
    if (e.pointers.length > 1) return;

    // on down, record start positions
    if (e.event === 'down') {
      start = { x: e.pointer.x, y: e.pointer.y };
      current = { x: e.pointer.x, y: e.pointer.y };

      // abort any slide animation
      // if currently animating to a different slide,
      // this will instantly move the slider to that slide
      e.abortController?.abort();
    }

    // on move, calculate deltas and translate image container
    if (e.event === 'move') {
      current = { x: e.pointer.x, y: e.pointer.y };

      const deltaX = current.x - start.x;
      const deltaY = current.y - start.y;

      // prettier-ignore
      if (
        (!axis && Math.abs(deltaY) > Math.abs(deltaX)) || 
        axis === 'y'
      ) {

        const percentY = (deltaY / window.innerHeight) * 100;
        vistaView.imageContainer!.style.transition = 'none';
        vistaView.imageContainer!.style.transform = `translateY(${percentY}vh)`;
        axis = 'y';

      } 
      
      // prettier-ignore 
      else if (
        (!axis && Math.abs(deltaX) > Math.abs(deltaY)) || 
        axis === 'x' && e.state.elmLength > 1
      ) {

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
        const deltaY = current.y - start.y;

        // swipe down
        if (Math.abs(deltaY) > 144) {
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
      if (axis === 'x' && e.state.elmLength > 1) {
        const deltaX = current.x - start.x;

        vistaView.imageContainer!.style.transition = '';

        // swipe right
        if (deltaX > 64) {
          vistaView.prev();
        }

        // swipe left
        else if (deltaX < -64) {
          vistaView.next();
        }

        // reset position
        else {
          resetPosition(`translateX(0vw)`);
        }
      }

      // reset
      axis = null;
      start = { x: 0, y: 0 };
      current = { x: 0, y: 0 };
    }
  });
}
