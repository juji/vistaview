export type PointaArgs = {
  elm?: HTMLElement | Document;
  listeners?: PointaListener[];
  startListeners?: boolean;
  enableHistory?: boolean;
  recordPointerEvent?: boolean;
  ignoreNonPrimary?: boolean;
  recordLastMovement?: boolean;
};

export type PointaEventData = {
  // Position
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  screenX: number;
  screenY: number;
  offsetX: number;
  offsetY: number;
  movementX: number;
  movementY: number;

  // Pointer specific
  pointerId: number;
  pointerType: string; // 'mouse' | 'pen' | 'touch'
  width: number;
  height: number;
  pressure: number;
  tangentialPressure: number;
  tiltX: number;
  tiltY: number;
  twist: number;

  // Button state
  button: number;
  buttons: number;

  // Modifiers
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;

  // Touch/pen
  isPrimary: boolean;

  // Timing
  timeStamp: number;
};

export type Pointa = {
  x: number;
  y: number;
  movementX: number;
  movementY: number;
  id: number | string;
  history?: Pointa[];
  pointerEvent?: Partial<PointaEventData>;
};

export type PointaEvent = 'down' | 'move' | 'up' | 'cancel';
export type PointaListenerArgs = {
  event: PointaEvent;
  pointer: Pointa | undefined;
  pointers: Pointa[];
  lastPointerLen: number;
};

export type VistaExternalPointerListenerArgs = PointaListenerArgs & {
  hasInternalExecution: boolean;
};

export type PointaListener = (args: PointaListenerArgs) => void;

// Pointas
export class Pointas {
  private pointers: Pointa[] = [];
  private elm: HTMLElement | Document;
  private listeners: PointaListener[] = [];
  private enableHistory: boolean = false;
  private lastPointerDownId: number | string | null = null;
  private ignoreNonPrimary: boolean = true;
  private recordLastMovement: boolean = false;
  private recordPointerEvent: boolean | ((e: PointerEvent) => Partial<PointaEventData>) = false;

  constructor({
    elm,
    listeners,
    startListeners = true,
    enableHistory = false,
    recordPointerEvent = false,
    ignoreNonPrimary = true,
    recordLastMovement = false,
  }: PointaArgs) {
    this.elm = elm ?? document;

    if (listeners) {
      this.listeners = listeners;
    }

    if (startListeners) this.startListeners();

    this.enableHistory = enableHistory;
    this.recordPointerEvent = recordPointerEvent;
    this.ignoreNonPrimary = ignoreNonPrimary;
    this.recordLastMovement = recordLastMovement;
  }

  private removeLastPointer = () => {
    if (!this.pointers.length) return;
    if (this.lastPointerDownId !== null) {
      const idx = this.pointers.findIndex((p) => p.id === this.lastPointerDownId);
      if (idx !== -1) {
        this.pointers.splice(idx, 1);
      }
    }
  };

  private setHistoryObject(pointer: Pointa) {
    if (this.enableHistory) {
      if (!pointer.history) pointer.history = [];
      const { history, ...eventData } = pointer;
      pointer.history!.push(eventData);
    }
  }

  private setPointerEventObject(pointer: Pointa, e: PointerEvent) {
    if (this.recordPointerEvent) {
      pointer.pointerEvent =
        typeof this.recordPointerEvent === 'function' ? this.recordPointerEvent(e) : { ...e };
    }
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0 && this.ignoreNonPrimary) return;

    e.preventDefault();

    // record last pointer down id for contextmenu/auxclick removal
    this.lastPointerDownId = e.pointerId;

    // add one-time listeners to remove pointer on contextmenu/auxclick
    window.addEventListener('contextmenu', this.removeLastPointer, { once: true });
    window.addEventListener('auxclick', this.removeLastPointer, { once: true });

    let pointer: Pointa = {
      x: e.clientX,
      y: e.clientY,
      movementX: 0,
      movementY: 0,
      id: e.pointerId,
    };

    this.setHistoryObject(pointer);
    this.setPointerEventObject(pointer, e);

    this.pointers.push(pointer);

    this.listeners.forEach((l) =>
      l({
        event: 'down',
        pointer: pointer,
        pointers: this.pointers,
        lastPointerLen: this.pointers.length - 1,
      })
    );
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    e.preventDefault();
    const pointer = this.pointers.find((p) => p.id === e.pointerId);
    if (!pointer) return;
    pointer.movementX = e.movementX;
    pointer.movementY = e.movementY;
    pointer.x = e.clientX;
    pointer.y = e.clientY;

    this.setHistoryObject(pointer);
    this.setPointerEventObject(pointer, e);

    this.listeners.forEach((l) =>
      l({
        event: 'move',
        pointer: pointer,
        pointers: this.pointers,
        lastPointerLen: this.pointers.length - 1,
      })
    );
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0 && this.ignoreNonPrimary) return;

    // remove one-time listeners
    window.removeEventListener('contextmenu', this.removeLastPointer);
    window.removeEventListener('auxclick', this.removeLastPointer);

    // Only handle if target is within our element
    if (
      e.target instanceof Node &&
      !this.elm.contains(e.target) &&
      e.target !== document.querySelector('html') &&
      e.target !== document
    )
      return;

    e.preventDefault();

    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    if (pointerIndex === -1) return;

    const pointer = this.pointers[pointerIndex];
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (this.recordLastMovement) {
      pointer.movementX = e.movementX;
      pointer.movementY = e.movementY;
    }
    const lastLen = this.pointers.length;

    this.setHistoryObject(pointer);
    this.setPointerEventObject(pointer, e);

    this.pointers.splice(pointerIndex, 1);

    this.listeners.forEach((l) =>
      l({
        event: 'up',
        pointer: pointer,
        pointers: this.pointers,
        lastPointerLen: lastLen,
      })
    );
  };

  private onPointerCancel = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Only handle if target is within our element
    if (
      e.target instanceof Node &&
      !this.elm.contains(e.target) &&
      e.target !== document.querySelector('html') &&
      e.target !== document
    )
      return;

    e.preventDefault();

    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    if (pointerIndex === -1) return;

    const pointer = this.pointers[pointerIndex];
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (this.recordLastMovement) {
      pointer.movementX = e.movementX;
      pointer.movementY = e.movementY;
    }
    const lastLen = this.pointers.length;

    this.setHistoryObject(pointer);
    this.setPointerEventObject(pointer, e);

    this.pointers.splice(pointerIndex, 1);

    this.listeners.forEach((l) =>
      l({
        event: 'cancel',
        pointer: pointer,
        pointers: this.pointers,
        lastPointerLen: lastLen,
      })
    );
  };

  startListeners() {
    this.elm.addEventListener('pointerdown', this.onPointerDown as EventListener);
    this.elm.addEventListener('pointermove', this.onPointerMove as EventListener);

    // Listen to up/cancel on document to catch events outside the element
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerCancel);
  }

  removeListeners() {
    this.elm.removeEventListener('pointerdown', this.onPointerDown as EventListener);
    this.elm.removeEventListener('pointermove', this.onPointerMove as EventListener);

    document.removeEventListener('pointerup', this.onPointerUp);
    document.removeEventListener('pointercancel', this.onPointerCancel);

    this.pointers = [];
  }

  addEventListener(listener: PointaListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: PointaListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  getPointerDistance(p1: Pointa, p2: Pointa): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getCentroid(): { x: number; y: number } | null {
    if (this.pointers.length === 0) return null;
    const sum = this.pointers.reduce(
      (acc, p) => {
        acc.x += p.x;
        acc.y += p.y;
        return acc;
      },
      { x: 0, y: 0 }
    );
    return {
      x: sum.x / this.pointers.length,
      y: sum.y / this.pointers.length,
    };
  }
}
