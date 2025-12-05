
import { vistaViewComponent, getDownloadButton } from "./components"
import { createTrustedHtml  } from "./utils"

export type VistaViewElm = {
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
  controls?: {
    topLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    topCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomCenter?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomLeft?: (VistaViewDefaultControls | VistaViewCustomControl)[];
    bottomRight?: (VistaViewDefaultControls | VistaViewCustomControl)[];
  }
}

export type VistaViewDefaultControls = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'download' | 'close';
export type VistaViewCustomControl = {
  name: string;
  icon: string;
  onClick: ( v: VistaViewImage ) => void;
}

const GlobalVistaState = {
  somethingOpened: false
}

const DefaultOptions = {
  controls: {
    topLeft: [
      'indexDisplay',
    ],
    topRight: [
      'zoomIn',
      'zoomOut',
      getDownloadButton(),
      'close'
    ]
  }
}

export class VistaView {

  private elements: VistaViewImage[];
  private currentIndex: number = 0;

  private rootElement: HTMLElement | null = null;
  private containerElement: HTMLElement | null = null;
  private isActive: boolean = false;

  private options: VistaViewOptions;
  private indexDisplayElement: HTMLElement | null = null;

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

  private setIndexDisplay(): void {
    if(!this.indexDisplayElement) return;
    this.indexDisplayElement.textContent = `${this.currentIndex + 1} / ${this.elements.length}`;
  }

  open(index?: number): void {
    
    // prevent opening if other vistaview is already opened 
    if(GlobalVistaState.somethingOpened) return;
    GlobalVistaState.somethingOpened = true;
    this.isActive = true;

    index = index || 0;

    this.currentIndex = index;

    // prepend
    const component = vistaViewComponent(this.elements, (this.options.controls || DefaultOptions.controls) as VistaViewOptions['controls']);
    document.body.prepend(createTrustedHtml(component));

    // set elements
    this.rootElement = document.querySelector('#vistaview-root');
    if(!this.rootElement) throw new Error('VistaView: Failed to create root element.');
    this.containerElement = this.rootElement.querySelector('.vistaview-container');
    if(!this.containerElement) throw new Error('VistaView: Failed to create container element.');
    this.indexDisplayElement = this.containerElement.querySelector('.vistaview-index-display');

    // add options
    if (this.options.animationDurationBase) {
      this.rootElement.style.setProperty('--vistaview-animation-duration', `${this.options.animationDurationBase}ms`);
    }

    // add vars
    const props = this.elements[index].anchorProps || this.elements[index].imageProps;
    const elm = props && this.elements[index].anchor ? this.elements[index].anchor : this.elements[index].image;
    if(!elm) throw new Error('VistaView: Failed to get element.');
    const pos = elm.getBoundingClientRect();

    this.rootElement.style.setProperty('--vistaview-container-initial-width', `${pos?.width}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-height', `${pos?.height}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-top', `${pos.top + pos.height / 2}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-left', `${pos.left + pos.width / 2}px`);
    this.rootElement.style.setProperty('--vistaview-center-x', `${window.innerWidth / 2}px`);
    this.rootElement.style.setProperty('--vistaview-center-y', `${window.innerHeight / 2}px`);

    // get all custom controls
    const allCustomControls = (this.options.controls ? [
      ...(this.options.controls.topLeft || []),
      ...(this.options.controls.topCenter || []),
      ...(this.options.controls.topRight || []),
      ...(this.options.controls.bottomLeft || []),
      ...(this.options.controls.bottomCenter || []),
      ...(this.options.controls.bottomRight || [])
    ] : [
      ...DefaultOptions.controls.topLeft || [],
      ...DefaultOptions.controls.topRight || [],
    ] ) .filter( c => typeof c !== 'string' ) as VistaViewCustomControl[];  
    
    // set buttons listeners
    this.containerElement.querySelectorAll('button').forEach( button => {
      const customControlName = button.getAttribute('data-vistaview-custom-control');
      if (customControlName) {
        const control = allCustomControls.find(c => c.name === customControlName) as VistaViewCustomControl | undefined;
        if (control) {
          button.addEventListener('click', () => {
            control.onClick(this.elements[this.currentIndex]);
          });
        }
      } else {
        // default control
        if (button.classList.contains('vistaview-zoom-in-button')) {
          button.addEventListener('click', () => {
            console.log('Zoom In clicked');
          });
        } else if (button.classList.contains('vistaview-zoom-out-button')) {
          button.addEventListener('click', () => {
            console.log('Zoom Out clicked');
          });
        } else if (button.classList.contains('vistaview-close-button')) {
          button.addEventListener('click', () => {
            this.close();
          })
        } else if (button.parentElement?.classList.contains('vistaview-prev-btn')) {
          button.addEventListener('click', () => {
            this.prev();
          });
        } else if (button.parentElement?.classList.contains('vistaview-next-btn')) {
          button.addEventListener('click', () => {
            this.next();
          });
        }
      }
    });

    // set current index display
    this.setIndexDisplay();

    // set as initialized
    setTimeout(() => {
      this.rootElement &&
      this.rootElement.classList.add('vistaview--initialized');
    },0)

    // 
  }

  async close(animate = true): Promise<void> {
    if(!this.isActive) return;
    this.isActive = false;

    if (animate) {

      // get animation duration base from css
      const style = window.getComputedStyle(this.rootElement!);
      const animationDurationBase = parseInt(style.getPropertyValue('--vistaview-animation-duration'))

      // wait for animation
      this.rootElement?.classList.add('vistaview--closing');
      await new Promise( resolve => {
        setTimeout( () => {
          resolve(true);
        }, (
          animationDurationBase
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
    this.setIndexDisplay();
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

