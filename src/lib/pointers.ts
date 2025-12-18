import type {
  VistaPointer,
  VistaPointerListener,
  VistaPointerArgs,
  VistaPointerEventData,
} from './types.js';

// Pointahs
// say it like the pepe julian onzima interviewer guy
export class VistaPointers {
  private pointers: VistaPointer[] = [];
  private elm: HTMLElement | Document;
  private listeners: VistaPointerListener[] = [];
  private enableHistory: boolean = false;
  private lastPointerDownId: number | string | null = null;
  private ignoreNonPrimary: boolean = true;
  private recordPointerEvent: boolean | ((e: PointerEvent) => Partial<VistaPointerEventData>) =
    false;

  constructor({
    elm,
    listeners,
    startListeners = true,
    enableHistory = false,
    recordPointerEvent = false,
    ignoreNonPrimary = true,
  }: VistaPointerArgs) {
    this.elm = elm ?? document;

    if (listeners) {
      this.listeners = listeners;
    }

    if (startListeners) this.startListeners();

    this.enableHistory = enableHistory;
    this.recordPointerEvent = recordPointerEvent;
    this.ignoreNonPrimary = ignoreNonPrimary;
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

  private setHistoryObject(pointer: VistaPointer) {
    if (this.enableHistory) {
      if (!pointer.history) pointer.history = [];
      const { history, ...eventData } = pointer;
      pointer.history!.push(eventData);
    }
  }

  private setPointerEventObject(pointer: VistaPointer, e: PointerEvent) {
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

    let pointer: VistaPointer = {
      x: e.clientX,
      y: e.clientY,
      lastTimestamp: e.timeStamp,
      velocityX: 0,
      velocityY: 0,
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
    pointer.velocityX = e.movementX / (e.timeStamp - pointer.lastTimestamp);
    pointer.velocityY = e.movementY / (e.timeStamp - pointer.lastTimestamp);
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.lastTimestamp = e.timeStamp;

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
      e.target !== document.querySelector('html')
    )
      return;

    e.preventDefault();

    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    if (pointerIndex === -1) return;

    const pointer = this.pointers[pointerIndex];
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.lastTimestamp = e.timeStamp;
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
      e.target !== document.querySelector('html')
    )
      return;

    e.preventDefault();

    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    if (pointerIndex === -1) return;

    const pointer = this.pointers[pointerIndex];
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.lastTimestamp = e.timeStamp;
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

  addEventListener(listener: VistaPointerListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: VistaPointerListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }

  getPointerDistance(p1: VistaPointer, p2: VistaPointer): number {
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
