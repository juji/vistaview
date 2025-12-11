export type VistaViewPointer = {
  x: number;
  y: number;
  id: number | string;
};

export type VistaViewPointerListener = (
  event: VistaViewPointerEvent,
  pointer: VistaViewPointer | undefined,
  pointers: { [key: string]: VistaViewPointer }
) => void;

export type VistaViewPointerEvent = 'down' | 'move' | 'up' | 'cancel';

export class VistaViewPointers {
  pointers: { [key: string]: VistaViewPointer } = {};
  elm: HTMLElement;
  listeners: VistaViewPointerListener[] = [];

  constructor(elm: HTMLElement) {
    this.elm = elm;
  }

  private onPointerDown(e: PointerEvent) {
    this.pointers[e.pointerId] = { x: e.clientX, y: e.clientY, id: e.pointerId };
    this.listeners.forEach((l) => l('down', this.pointers[e.pointerId], this.pointers));
  }

  private onPointerMove(e: PointerEvent) {
    const pointer = this.pointers[e.pointerId];
    if (pointer) {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
    }
    this.listeners.forEach((l) => l('move', this.pointers[e.pointerId], this.pointers));
  }
  private onPointerUp(e: PointerEvent) {
    const pointer = this.pointers[e.pointerId];
    if (pointer) {
      delete this.pointers[e.pointerId];
    }
    this.listeners.forEach((l) => l('up', pointer, this.pointers));
  }

  private onPointerCancel(e: PointerEvent) {
    const pointer = this.pointers[e.pointerId];
    if (pointer) {
      delete this.pointers[e.pointerId];
    }
    this.listeners.forEach((l) => l('cancel', pointer, this.pointers));
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

    this.pointers = {};
  }

  addEventListener(listener: VistaViewPointerListener) {
    this.listeners.push(listener);
  }

  removeEventListener(listener: VistaViewPointerListener) {
    this.listeners = this.listeners.filter((l) => l !== listener);
  }
}
