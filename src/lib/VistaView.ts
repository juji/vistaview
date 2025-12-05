
export type VistaViewElm = {
  width: number 
  height: number 
  naturalWidth: number
  naturalHeight: number
  objectFit?: string
  borderRadius?: string
  objectPosition?: string
  overflow?: string
}

export type VistaViewImage = {
  src: string;
  width: number;
  height: number;
  smallSrc?: string;
  anchorProps?: VistaViewElm
  anchor?: HTMLAnchorElement
  imageProps?: VistaViewElm
  image?: HTMLImageElement
}

export class VistaView {

  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  constructor(elements: VistaViewImage[]) {
    this.elements = elements;
  }

  open(index: number = 0): void {
    console.log(`VistaView: open called with index ${index}`);
  }

  close(): void {
    console.log('VistaView: close called');
  }

  view(index: number): void {
    console.log(`VistaView: view called with index ${index}`);
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.elements.length;
    console.log('VistaView: next called');
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.elements.length) % this.elements.length;
    console.log('VistaView: previous called');
  }

  getCurrentIndex(): number {
    return this.currentIndex;
  }

  destroy(): void {
    console.log('VistaView: destroy called');
  }

}

