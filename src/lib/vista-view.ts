
import { vistaViewComponent } from "./components"
import { createTrustedHtml } from "./utils"

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
  alt?: string;
  smallSrc?: string;
  anchorProps?: VistaViewElm
  anchor?: HTMLAnchorElement
  imageProps?: VistaViewElm
  image?: HTMLImageElement,
  onClick?: ( e: Event ) => void
}

const GlobalVistaState = {
  somethingOpened: false
}

export class VistaView {

  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  constructor(elements: VistaViewImage[]) {
    this.elements = elements;

    this.elements.forEach((el, index) => {
      const clickable = el.anchor || el.image;
      if (clickable) {
        el.onClick = (e) => {
          e.preventDefault();
          this.open(index);
        };
        clickable.addEventListener('click', el.onClick);
      }
    });

  }

  open(index?: number): void {
    
    // prevent opening if other vistaview is already opened 
    if(GlobalVistaState.somethingOpened) return;
    GlobalVistaState.somethingOpened = true;

    index = index || 0;

    this.currentIndex = index;

    const component = vistaViewComponent(this.elements);
    document.body.insertAdjacentHTML('afterbegin', createTrustedHtml(component) as unknown as string);
  }

  close(): void {
    GlobalVistaState.somethingOpened = false;
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
    GlobalVistaState.somethingOpened = false;
    this.elements.forEach((el, index) => {
      const clickable = el.anchor || el.image;
      if (clickable && el.onClick) {
        clickable.removeEventListener('click', el.onClick);
      }
    });
  }

}

