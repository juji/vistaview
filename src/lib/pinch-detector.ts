export interface PinchGestureState {
  isActive: boolean;
  startDistance: number;
  currentDistance: number;
  scale: number;
  center: { x: number; y: number };
  direction: 'in' | 'out' | null;
  touches: TouchList | null;
}

export class PinchDetector {
  private pinchState: PinchGestureState = {
    isActive: false,
    startDistance: 0,
    currentDistance: 0,
    scale: 1,
    center: { x: 0, y: 0 },
    direction: null,
    touches: null,
  };

  private element: HTMLElement;
  private pinchStartListeners: ((state: PinchGestureState) => void)[] = [];
  private pinchMoveListeners: ((state: PinchGestureState) => void)[] = [];
  private pinchEndListeners: ((state: PinchGestureState) => void)[] = [];

  constructor(element: HTMLElement) {
    this.element = element;
    this.attachEventListeners();
  }

  private getTouchDistance(touches: TouchList): number {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getTouchCenter(touches: TouchList): { x: number; y: number } {
    if (touches.length < 2) return { x: 0, y: 0 };
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      this.pinchState.isActive = true;
      this.pinchState.startDistance = this.getTouchDistance(e.touches);
      this.pinchState.currentDistance = this.pinchState.startDistance;
      this.pinchState.scale = 1;
      this.pinchState.center = this.getTouchCenter(e.touches);
      this.pinchState.direction = null;
      this.pinchState.touches = e.touches;
      this.pinchStartListeners.forEach((listener) => listener(this.pinchState));
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (this.pinchState.isActive && e.touches.length === 2) {
      e.preventDefault();
      this.pinchState.currentDistance = this.getTouchDistance(e.touches);
      this.pinchState.scale = this.pinchState.currentDistance / this.pinchState.startDistance;
      this.pinchState.center = this.getTouchCenter(e.touches);

      // Determine pinch direction based on scale
      if (this.pinchState.scale > 1.02) {
        this.pinchState.direction = 'out'; // Pinch out = zoom in
      } else if (this.pinchState.scale < 0.98) {
        this.pinchState.direction = 'in'; // Pinch in = zoom out
      }

      this.pinchMoveListeners.forEach((listener) => listener(this.pinchState));
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (this.pinchState.isActive && e.touches.length < 2) {
      this.pinchEndListeners.forEach((listener) => listener(this.pinchState));
      this.pinchState.isActive = false;
      this.pinchState.startDistance = 0;
      this.pinchState.currentDistance = 0;
      this.pinchState.scale = 1;
      this.pinchState.direction = null;
    }
  };

  private attachEventListeners(): void {
    this.element.addEventListener('touchstart', this.onTouchStart, { passive: false });
    this.element.addEventListener('touchmove', this.onTouchMove, { passive: false });
    this.element.addEventListener('touchend', this.onTouchEnd, { passive: false });
    this.element.addEventListener('touchcancel', this.onTouchEnd, { passive: false });
  }

  public cleanup(): void {
    this.element.removeEventListener('touchstart', this.onTouchStart);
    this.element.removeEventListener('touchmove', this.onTouchMove);
    this.element.removeEventListener('touchend', this.onTouchEnd);
    this.element.removeEventListener('touchcancel', this.onTouchEnd);

    // Clear all listeners
    this.pinchStartListeners.length = 0;
    this.pinchMoveListeners.length = 0;
    this.pinchEndListeners.length = 0;
  }

  public isPinching(): boolean {
    return this.pinchState.isActive;
  }

  public getState(): PinchGestureState {
    return { ...this.pinchState };
  }

  public onPinchStart(listener: (state: PinchGestureState) => void): () => void {
    this.pinchStartListeners.push(listener);
    return () => {
      const index = this.pinchStartListeners.indexOf(listener);
      if (index > -1) {
        this.pinchStartListeners.splice(index, 1);
      }
    };
  }

  public onPinchMove(listener: (state: PinchGestureState) => void): () => void {
    this.pinchMoveListeners.push(listener);
    return () => {
      const index = this.pinchMoveListeners.indexOf(listener);
      if (index > -1) {
        this.pinchMoveListeners.splice(index, 1);
      }
    };
  }

  public onPinchEnd(listener: (state: PinchGestureState) => void): () => void {
    this.pinchEndListeners.push(listener);
    return () => {
      const index = this.pinchEndListeners.indexOf(listener);
      if (index > -1) {
        this.pinchEndListeners.splice(index, 1);
      }
    };
  }
}
