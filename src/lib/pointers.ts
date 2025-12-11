export type VistaViewPointer = {
  x: number;
  y: number;
  id: number | string;
};

export type VistaViewPointerEvent = 'down' | 'move' | 'up' | 'cancel';
export type VistaViewPointerListenerArgs = {
  event: VistaViewPointerEvent;
  pointer: VistaViewPointer | undefined;
  domEvent: PointerEvent;
};

export type VistaViewPointerListener = (args: VistaViewPointerListenerArgs) => void;

export class VistaViewPointers {
  pointers: VistaViewPointer[] = [];
  length = 0;
  private elm: HTMLElement;
  private listeners: VistaViewPointerListener[] = [];

  constructor(elm: HTMLElement) {
    this.elm = elm;
  }

  getPointerDistance(p1: VistaViewPointer, p2: VistaViewPointer): number {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private onPointerDown(e: PointerEvent) {
    if (!this.listeners.length) return;
    const pointer = { x: e.clientX, y: e.clientY, id: e.pointerId };
    this.pointers.push(pointer);
    this.length = this.pointers.length;
    this.listeners.forEach((l) =>
      l({
        event: 'down',
        pointer: pointer,
        domEvent: e,
      })
    );
  }

  private onPointerMove(e: PointerEvent) {
    if (!this.listeners.length) return;
    const pointer = this.pointers.find((p) => p.id === e.pointerId);
    if (pointer) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    this.listeners.forEach((l) =>
      l({
        event: 'move',
        pointer: pointer,
        domEvent: e,
      })
    );
  }
  private onPointerUp(e: PointerEvent) {
    if (!this.listeners.length) return;
    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    const pointer = this.pointers[pointerIndex];
    if (pointerIndex !== -1) {
      this.pointers.splice(pointerIndex, 1);
    }
    this.length = this.pointers.length;
    this.listeners.forEach((l) =>
      l({
        event: 'up',
        pointer: pointer,
        domEvent: e,
      })
    );
  }

  private onPointerCancel(e: PointerEvent) {
    if (!this.listeners.length) return;
    const pointerIndex = this.pointers.findIndex((p) => p.id === e.pointerId);
    const pointer = this.pointers[pointerIndex];
    if (pointer) {
      this.pointers.splice(pointerIndex, 1);
    }
    this.length = this.pointers.length;
    this.listeners.forEach((l) =>
      l({
        event: 'cancel',
        pointer: pointer,
        domEvent: e,
      })
    );
  }

  startListeners() {
    this.elm.addEventListener('pointerdown', this.onPointerDown);
    this.elm.addEventListener('pointermove', this.onPointerMove);
    this.elm.addEventListener('pointerup', this.onPointerUp);
    this.elm.addEventListener('pointercancel', this.onPointerCancel);
  }

  removeListeners() {
    this.elm.removeEventListener('pointerdown', this.onPointerDown);
    this.elm.removeEventListener('pointermove', this.onPointerMove);
    this.elm.removeEventListener('pointerup', this.onPointerUp);
    this.elm.removeEventListener('pointercancel', this.onPointerCancel);

    this.pointers = [];
    this.length = 0;
  }

  addEventListener(listener: VistaViewPointerListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: VistaViewPointerListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}
