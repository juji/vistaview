
import { vistaViewComponent, getDownloadButton } from "./components"
import { createTrustedHtml, getElmProperties, isNotZeroCssValue  } from "./utils"

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
  anchor?: HTMLAnchorElement
  image?: HTMLImageElement,
  onClick?: ( e: Event ) => void
}

export type VistaViewOptions = {
  animationDurationBase?: number;
  initialZIndex?: number;
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
  private setInitialProperties: (() => void) | null = null;

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

    if(index < 0 || index >= this.elements.length) {
      throw new Error('VistaView: Index out of bounds:' + index);
    }

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

    if( this.options.initialZIndex !== undefined ) {
      this.rootElement.style.setProperty('--vistaview-initial-z-index', `${this.options.initialZIndex}`);
    }

    // add vars
    const imageProps = this.elements[index].image ? getElmProperties(this.elements[index].image as HTMLImageElement) : undefined;
    const anchorProps = this.elements[index].anchor ? getElmProperties(this.elements[index].anchor as HTMLAnchorElement) : undefined;
    const elm = this.elements[index].anchor ? this.elements[index].anchor : this.elements[index].image;
    if(!elm) throw new Error('VistaView: Failed to get element.');
    const pos = elm.getBoundingClientRect();

    this.rootElement.style.setProperty('--vistaview-container-initial-width', `${pos?.width}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-height', `${pos?.height}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-top', `${pos.top + pos.height / 2}px`);
    this.rootElement.style.setProperty('--vistaview-container-initial-left', `${pos.left + pos.width / 2}px`);
    this.rootElement.style.setProperty('--vistaview-number-elements', `${this.elements.length}`);
    this.rootElement.style.setProperty('--vistaview-image-border-radius', 
      isNotZeroCssValue(imageProps?.borderRadius) || isNotZeroCssValue(anchorProps?.borderRadius) || '0px');

    // set properties on window resize
    this.setInitialProperties = () => {
      if(!this.isActive) return;
      const elm = this.elements[this.currentIndex].anchor ? this.elements[this.currentIndex].anchor : this.elements[this.currentIndex].image;
      if(!elm) return;
      const pos = elm.getBoundingClientRect();
      this.rootElement?.style.setProperty('--vistaview-container-initial-width', `${pos?.width}px`);
      this.rootElement?.style.setProperty('--vistaview-container-initial-height', `${pos?.height}px`);
      this.rootElement?.style.setProperty('--vistaview-container-initial-top', `${pos.top + pos.height / 2}px`);
      this.rootElement?.style.setProperty('--vistaview-container-initial-left', `${pos.left + pos.width / 2}px`);
    };
    window.addEventListener('resize', this.setInitialProperties);

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

    // set current index css var
    this.rootElement?.style.setProperty('--vistaview-current-index', `${this.currentIndex}`);

    // set as initialized
    setTimeout(() => {
      this.rootElement &&
      this.rootElement.classList.add('vistaview--initialized');
    },33)

    // 
  }

  private getAnimationDurationBase(): number {
    const style = window.getComputedStyle(this.rootElement!);
    return parseInt(style.getPropertyValue('--vistaview-animation-duration'));
  }

  async close(animate = true): Promise<void> {
    if(!this.isActive) return;
    this.isActive = false;

    if (animate) {

      // get animation duration base from css
      const animationDurationBase = this.getAnimationDurationBase();

      // wait for animation
      this.rootElement?.classList.add('vistaview--closing');
      await new Promise( resolve => {
        setTimeout( () => {
          resolve(true);
        }, (
          animationDurationBase
        ) * 1.5);
      });

    }

    // Remove the root element
    this.rootElement?.remove();
    this.rootElement = null;
    this.containerElement = null;
    this.setInitialProperties && window.removeEventListener('resize', this.setInitialProperties);
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
    if(index < 0 || index >= this.elements.length) {
      throw new Error('VistaView: Index out of bounds:' + index);
    }
    this.currentIndex = index;
    this.setIndexDisplay();
    this.setInitialProperties && this.setInitialProperties()
    this.rootElement?.style.setProperty('--vistaview-current-index', `${this.currentIndex}`);
  }

  next(): void {
    if(!this.isActive) return;
    this.view((this.currentIndex + 1) % this.elements.length);
  }

  prev(): void {
    if(!this.isActive) return;
    this.view((this.currentIndex - 1 + this.elements.length) % this.elements.length);
  }

  getCurrentIndex(): number {
    return this.isActive ? this.currentIndex : -1;
  }

}

