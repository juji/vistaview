import { VistaPointers } from './vista-pointers';
import type { VistaExternalPointerListenerArgs, VistaPointerListenerArgs } from './types';
import type { VistaView } from './vista-view';

export class VistaImageEvent {
  //
  private pointers: VistaPointers | null = null;

  // Pinch gesture state
  private lastDistance = 0;
  private pinchMode = false;
  private lastPinchEndTime = 0;
  private PINCH_COOLDOWN = 111;
  private cancelMove = () => {};
  private pointerListeners: ((e: VistaExternalPointerListenerArgs) => void)[] = [];
  private vvw: VistaView;
  // private vistaImage: VistaImage;
  private imageContainer: HTMLElement | null = null;

  constructor(vvw: VistaView) {
    this.vvw = vvw;
    // this.vistaImage = vistaImage;
  }

  // register external pointer listener
  registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void {
    this.pointerListeners.push(listener);
  }

  private isPinching = () => {
    return this.pinchMode || performance.now() - this.lastPinchEndTime < this.PINCH_COOLDOWN;
  };

  private internalPointerListener = (e: VistaPointerListenerArgs) => {
    // Detect if we are pinching - to prevent conflict with single pointer move
    // Adds a small cooldown after pinch ends to avoid immediate single pointer move
    const vistaImage = this.vvw.state.children.images.find((img) => img.pos === 0)!;

    // POINTER DOWN - Start drag or pinch
    if (e.event === 'down') {
      this.cancelMove();

      // Single finger: prepare for drag (if zoomed in)
      if (this.vvw.state.zoomedIn && e.pointers.length === 1 && !this.isPinching()) {
        const center = this.pointers!.getCentroid();
        vistaImage.setInitialCenter(center!);
      }

      // Two fingers: start pinch zoom
      if (e.pointers.length >= 2) {
        this.pinchMode = true;
        const center = this.pointers!.getCentroid();
        this.lastDistance = this.pointers!.getPointerDistance(e.pointers[0], e.pointers[1]);
        vistaImage.setInitialCenter(center!);
      }
    }

    // POINTER MOVE - Drag or pinch zoom
    else if (e.event === 'move') {
      // Single finger drag (when zoomed in)
      if (
        this.vvw.state.zoomedIn &&
        e.pointers.length === 1 &&
        e.lastPointerLen === 0 &&
        !this.isPinching()
      ) {
        const center = this.pointers!.getCentroid();
        vistaImage.scaleMove(1, center!);
      }

      // Two finger pinch zoom
      if (e.pointers.length >= 2 && this.pinchMode) {
        const center = this.pointers!.getCentroid();
        const distance = this.pointers!.getPointerDistance(e.pointers[0], e.pointers[1]);
        vistaImage.scaleMove(distance / this.lastDistance, center!);
      }
    }

    // POINTER UP - End drag/pinch, normalize position
    else if (
      (e.event === 'up' || e.event === 'cancel') &&
      (this.pinchMode || this.vvw.state.zoomedIn)
    ) {
      if (this.pinchMode) {
        // End pinch: normalize zoom level, close if zoomed out too far
        this.lastPinchEndTime = performance.now();
        this.pinchMode = false;
        // const close = vistaImage.normalize();
        const ret = vistaImage.setFinalTransform();
        if (ret?.cancel) {
          this.cancelMove = ret.cancel;
        }
        if (ret?.close) {
          requestAnimationFrame(() => {
            this.vvw.close();
          });
        }
      } else if (this.vvw.state.zoomedIn && e.pointers.length === 0 && !this.isPinching()) {
        // End drag: animate back to bounds if necessary
        vistaImage.isThrowing = true;
        this.cancelMove = vistaImage.momentumThrow({
          x: e.pointer.movementX,
          y: e.pointer.movementY,
        });
      }
    }

    // Notify external listeners (user-registered pointer handlers)
    this.pointerListeners.forEach((l) =>
      l({
        ...e,
        state: this.vvw.state,
        hasInternalExecution: this.vvw.state.zoomedIn || this.isPinching(),
        abortController: this.vvw.state.abortController,
      })
    );
  };

  onKeyDown = (e: KeyboardEvent) => {
    const vvw = this.vvw;
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        vvw.prev();
        break;
      case 'ArrowRight':
        e.preventDefault();
        vvw.next();
        break;
      case 'ArrowUp':
        e.preventDefault();
        vvw.zoomIn();
        break;
      case 'ArrowDown':
        e.preventDefault();
        vvw.zoomOut();
        break;
      case 'Escape':
        e.preventDefault();
        vvw.close();
        break;
    }
  };

  onScroll = (e: Event) => {
    e.preventDefault();
    const vvw = this.vvw;
    const vistaImage = this.vvw.state.children.images.find((img) => img.pos === 0)!;

    const delta = (e as WheelEvent).deltaY;

    vistaImage.setInitialCenter({
      x: (e as WheelEvent).clientX,
      y: (e as WheelEvent).clientY,
    });

    if (delta < 0) {
      vvw.zoomIn();
    } else if (delta > 0) {
      vvw.zoomOut();
    }
  };

  onResizeHandler = () => {
    this.vvw.state.children.images.forEach((vistaImage) => {
      vistaImage.setSizes();
    });
  };

  start(imageContainer: HTMLElement) {
    // keyboard events
    if (this.vvw.options.keyboardListeners) window.addEventListener('keydown', this.onKeyDown);

    // scroll Events
    this.imageContainer = imageContainer;
    this.imageContainer.addEventListener('wheel', this.onScroll, { passive: false });

    // resize listener
    window.addEventListener('resize', this.onResizeHandler);

    this.pointers = new VistaPointers({
      elm: imageContainer,
      listeners: [this.internalPointerListener],
    });
  }

  stop() {
    if (this.vvw.options.keyboardListeners) window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('resize', this.onResizeHandler);
    this.imageContainer!.removeEventListener('wheel', this.onScroll);
    this.pointers!.removeListeners();
    this.pointerListeners = [];
  }
}
