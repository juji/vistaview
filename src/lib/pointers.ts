export type VistaViewPointer = {
  x: number;
  y: number;
  id: number | string;
};

export type VistaViewPointerEvent = 'down' | 'move' | 'up' | 'cancel';
export type VistaViewPointerListenerArgs = {
  event: VistaViewPointerEvent;
  pointer: VistaViewPointer | undefined;
  pointers: VistaViewPointer[];
  domEvent: PointerEvent;
};

export type VistaViewPointerListener = (args: VistaViewPointerListenerArgs) => void;

export class VistaViewPointers {
  pointers: VistaViewPointer[] = [];
  elm: HTMLElement;
  listeners: VistaViewPointerListener[] = [];

  constructor(elm: HTMLElement) {
    this.elm = elm;
  }

  private onPointerDown(e: PointerEvent) {
    this.pointers[e.pointerId] = { x: e.clientX, y: e.clientY, id: e.pointerId };
    this.listeners.forEach((l) =>
      l({
        event: 'down',
        pointer: this.pointers[e.pointerId],
        pointers: this.pointers,
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
        pointers: this.pointers,
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
    this.listeners.forEach((l) =>
      l({
        event: 'up',
        pointer: pointer,
        pointers: this.pointers,
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
    this.listeners.forEach((l) =>
      l({
        event: 'cancel',
        pointer: pointer,
        pointers: this.pointers,
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
  }

  addEventListener(listener: VistaViewPointerListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: VistaViewPointerListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}
