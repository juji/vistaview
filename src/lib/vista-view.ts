
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

export type VistaViewOptions = {
  animationDurationBase?: number;
}

const GlobalVistaState = {
  somethingOpened: false
}

const DefaultOptions = {
  animationDurationBase: 300
}

export class VistaView {

  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  private rootElement: HTMLElement | null = null;
  private containerElement: HTMLElement | null = null;
  private isActive: boolean = false;

  private options: VistaViewOptions;

  constructor(
    elements: VistaViewImage[],
    options: VistaViewOptions
  ) {
    
    this.elements = elements;
    this.options = options;

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
    this.isActive = true;

    index = index || 0;

    this.currentIndex = index;

    // prepend
    const component = vistaViewComponent(this.elements);
    document.body.prepend(createTrustedHtml(component));

    // set elements
    this.rootElement = document.querySelector('#vistaview-root');
    if(!this.rootElement) throw new Error('VistaView: Failed to create root element.');
    this.containerElement = this.rootElement.querySelector('.vistaview-container');
    if(!this.containerElement) throw new Error('VistaView: Failed to create container element.');

    // add options
    if (this.options.animationDurationBase) {
      this.rootElement.style.setProperty('--vistaview-animation-duration', `${this.options.animationDurationBase}ms`);
    }


    // 
  }

  async close(animate = true): Promise<void> {
    if(!this.isActive) return;
    this.isActive = false;

    if (animate) {

      // wait for animation
      this.rootElement?.classList.add('vistaview--closing');
      await new Promise( resolve => {
        setTimeout( () => {
          resolve(true);
        }, (
          this.options.animationDurationBase || 
          DefaultOptions.animationDurationBase
        ) * 2);
      });

    }

    // Remove the root element
    this.rootElement?.remove();
    this.rootElement = null;
    this.containerElement = null;
    GlobalVistaState.somethingOpened = false;

  }

  destroy(): void {
    if(!this.isActive) return;
    this.close( false );
    this.elements.forEach((el) => {
      const clickable = el.anchor || el.image;
      if (clickable && el.onClick) {
        clickable.removeEventListener('click', el.onClick);
      }
    });
  }

  view(index: number): void {
    if(!this.isActive) return;
    this.currentIndex = index;
    console.log(`VistaView: view called with index ${index}`);
  }

  next(): void {
    if(!this.isActive) return;
    this.view((this.currentIndex + 1) % this.elements.length);
    console.log('VistaView: next called');
  }

  prev(): void {
    if(!this.isActive) return;
    this.view((this.currentIndex - 1 + this.elements.length) % this.elements.length);
    console.log('VistaView: previous called');
  }

  getCurrentIndex(): number {
    return this.isActive ? this.currentIndex : -1;
  }

}

