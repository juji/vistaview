import type { VistaPointer, VistaPointerListener, VistaPointerArgs } from './types.js';

// Pointahs
// say it like the pepe julian onzima interviewer guy
export class VistaPointers {
  private pointers: VistaPointer[] = [];
  private elm: HTMLElement | Document;
  private listeners: VistaPointerListener[] = [];
  private enableHistory: boolean = false;
  private lastPointerDownId: number | string | null = null;

  // private preventContextMenu = (e: MouseEvent) => {
  //   console.log('prevented context menu');
  //   e.preventDefault();
  // };

  private removeLastPointer = () => {
    if (!this.pointers.length) return;
    if (this.lastPointerDownId !== null) {
      const idx = this.pointers.findIndex((p) => p.id === this.lastPointerDownId);
      if (idx !== -1) {
        this.pointers.splice(idx, 1);
      }
    }
  };

  constructor({ elm, listeners, startListeners = true, enableHistory = false }: VistaPointerArgs) {
    this.elm = elm ?? document;
    if (listeners) {
      this.listeners = listeners;
    }
    if (startListeners) this.startListeners();
    this.enableHistory = enableHistory;
  }

  private onPointerDown = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0) return;

    e.preventDefault();

    // Prevent context menu only for mouse (not touch/pen), to block right-click but allow mobile long-press
    // if (e.pointerType === 'mouse') {
    //   window.addEventListener('contextmenu', this.preventContextMenu);
    // }

    this.lastPointerDownId = e.pointerId;

    window.addEventListener('contextmenu', this.removeLastPointer, { once: true });

    const pointer = {
      x: e.clientX,
      y: e.clientY,
      pressure: e.pressure,
      lastTimestamp: e.timeStamp,
      ...(this.enableHistory
        ? {
            history: [{ x: e.clientX, y: e.clientY, pressure: e.pressure, time: e.timeStamp }],
          }
        : {}),
      velocityX: 0,
      velocityY: 0,
      id: e.pointerId,
    };
    this.pointers.push(pointer);

    this.listeners.forEach((l) =>
      l({
        event: 'down',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.pointers.length - 1,
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
      pointer.history?.push({
        x: e.clientX,
        y: e.clientY,
        pressure: e.pressure,
        time: e.timeStamp,
      });
    }
    this.listeners.forEach((l) =>
      l({
        event: 'move',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: this.pointers.length - 1,
      })
    );
  };

  private onPointerUp = (e: PointerEvent) => {
    if (!this.listeners.length) return;

    // Ignore non-primary button clicks (right-click, middle-click, etc.)
    if (e.button !== 0) return;

    // Release context menu prevention only for mouse
    // if (e.pointerType === 'mouse') {
    //   window.removeEventListener('contextmenu', this.preventContextMenu);
    // }

    window.removeEventListener('contextmenu', this.removeLastPointer);

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
    const lastLen = this.pointers.length;
    this.pointers.splice(pointerIndex, 1);
    this.listeners.forEach((l) =>
      l({
        event: 'up',
        pointer: pointer,
        domEvent: e,
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
    const pointer = this.pointers[pointerIndex];
    const lastLen = this.pointers.length;
    this.pointers.splice(pointerIndex, 1);
    this.listeners.forEach((l) =>
      l({
        event: 'cancel',
        pointer: pointer,
        domEvent: e,
        pointers: this.pointers,
        lastPointerLen: lastLen,
      })
    );
  };

  startListeners() {
    this.elm.addEventListener('pointerdown', this.onPointerDown as EventListener);
    this.elm.addEventListener('pointermove', this.onPointerMove as EventListener);

    // this.elm.addEventListener('pointerup', this.onPointerUp);
    // this.elm.addEventListener('pointercancel', this.onPointerCancel);

    // Listen to up/cancel on document to catch events outside the element
    document.addEventListener('pointerup', this.onPointerUp);
    document.addEventListener('pointercancel', this.onPointerCancel);
  }

  removeListeners() {
    this.elm.removeEventListener('pointerdown', this.onPointerDown as EventListener);
    this.elm.removeEventListener('pointermove', this.onPointerMove as EventListener);

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
