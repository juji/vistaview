import type { VistaPointer, VistaPointerListener } from './types.js';

export class VistaPointers {
  private pointers: VistaPointer[] = [];
  private elm: HTMLElement;
  private listeners: VistaPointerListener[] = [];
  private lastLen: number = 0;

  private preventContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  constructor(elm: HTMLElement, listeners?: VistaPointerListener[], startListeners = true) {
    this.elm = elm;
    if (listeners) {
      this.listeners = listeners;
    }
    if (startListeners) this.startListeners();
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0) return;

    e.preventDefault();

    // Prevent context menu only for mouse (not touch/pen), to block right-click but allow mobile long-press
    if (e.pointerType === 'mouse') {
      window.addEventListener('contextmenu', this.preventContextMenu);
    }

    const pointer = {
      x: e.clientX,
      y: e.clientY,
      pressure: e.pressure,
      lastTimestamp: e.timeStamp,
      history: [{ x: e.clientX, y: e.clientY, pressure: e.pressure, time: e.timeStamp }],
      velocityX: 0,
      velocityY: 0,
      id: e.pointerId,
    };
    this.pointers.push(pointer);
    this.lastLen = this.pointers.length - 1;

    this.listeners.forEach((l) =>
      l({
        event: 'down',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.lastLen,
      })
    );
  };

  private onPointerMove = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    e.preventDefault();
    const pointer = this.pointers.find((p) => p.id === e.pointerId);
    if (pointer) {
      pointer.velocityX = (e.clientX - pointer.x) / (e.timeStamp - pointer.lastTimestamp);
      pointer.velocityY = (e.clientY - pointer.y) / (e.timeStamp - pointer.lastTimestamp);
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.lastTimestamp = e.timeStamp;
      pointer.history.push({ x: e.clientX, y: e.clientY, pressure: e.pressure, time: e.timeStamp });
    }
    this.listeners.forEach((l) =>
      l({
        event: 'move',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.lastLen,
      })
    );
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0) return;

    // Release context menu prevention only for mouse
    if (e.pointerType === 'mouse') {
      window.removeEventListener('contextmenu', this.preventContextMenu);
    }

    // Only handle if target is within our element
    if (
      e.target instanceof Node &&
      !this.elm.contains(e.target) &&
      e.target !== document.querySelector('html')
    )
      return;

    e.preventDefault();
    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    const pointer = this.pointers[pointerIndex];
    if (pointer) {
      this.pointers.splice(pointerIndex, 1);
      this.lastLen = this.pointers.length + 1;
    }
    this.listeners.forEach((l) =>
      l({
        event: 'up',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.lastLen,
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
    const pointer = this.pointers[pointerIndex];
    if (pointer) {
      this.pointers.splice(pointerIndex, 1);
      this.lastLen = this.pointers.length + 1;
    }
    this.listeners.forEach((l) =>
      l({
        event: 'cancel',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.lastLen,
      })
    );
  };

  startListeners() {
    this.elm.addEventListener('pointerdown', this.onPointerDown);
    this.elm.addEventListener('pointermove', this.onPointerMove);

    // this.elm.addEventListener('pointerup', this.onPointerUp);
    // this.elm.addEventListener('pointercancel', this.onPointerCancel);

    // Listen to up/cancel on document to catch events outside the element
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerCancel);
  }

  removeListeners() {
    this.elm.removeEventListener('pointerdown', this.onPointerDown);
    this.elm.removeEventListener('pointermove', this.onPointerMove);

    // this.elm.removeEventListener('pointerup', this.onPointerUp);
    // this.elm.removeEventListener('pointercancel', this.onPointerCancel);

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
