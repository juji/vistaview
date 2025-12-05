
import { VistaView, DefaultOptions } from './lib/vista-view';
import type { VistaViewImage, VistaViewElm, VistaViewOptions as VistaViewOptionsBase } from './lib/vista-view';
import './style.css';

// Re-export types for library consumers
export type { VistaViewImage, VistaViewElm, VistaViewOptionsBase };
export { DefaultOptions };


export type VistaViewOptions = {
  parent?: HTMLElement;
  elements?: string | NodeListOf<HTMLElement> | VistaViewImage[];
} & VistaViewOptionsBase

export function vistaView( options: VistaViewOptions ): VistaView {

  let {
    parent,
    elements,
    ...vistaViewOptionsBase
  } = options

  if(!parent && !elements) {
    throw new Error('VistaView: No parent or elements specified.');
  }

  if(parent) {
    let childElements = Array.from(parent.querySelectorAll<HTMLElement>('img[data-vistaview-src]'));
    if(!childElements.length) {
      childElements = Array.from(parent.querySelectorAll<HTMLElement>('a[href]'));
    }

    elements = childElements.map( el => {

      return {
        src: el.dataset.vistaviewSrc || el.getAttribute('href') || '',
        width: el.dataset.vistaviewWidth ? parseInt(el.dataset.vistaviewWidth) : ( el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).naturalWidth : 0 ),
        height: el.dataset.vistaviewHeight ? parseInt(el.dataset.vistaviewHeight) : ( el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).naturalHeight : 0 ),
        smallSrc: el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).src : el.dataset.vistaviewSmallsrc || el.getAttribute('src') || '',
        alt: el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).alt : el.dataset.vistaviewAlt || el.getAttribute('alt') || '',
        anchor: el instanceof HTMLAnchorElement ? el : undefined,
        image: el instanceof HTMLImageElement ? el as HTMLImageElement : 
          el.querySelector('img') ? el.querySelector('img') as HTMLImageElement : undefined
      }

    })

  }else if(elements) {

    if(typeof elements === 'string'){
      elements = document.querySelectorAll<HTMLElement>(elements);
    }

    if(elements instanceof NodeList){
      elements = Array.from(elements).map( el => {

        return {
          src: el.dataset.vistaviewSrc || el.getAttribute('href') || '',
          width: el.dataset.vistaviewWidth ? parseInt(el.dataset.vistaviewWidth) : ( el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).naturalWidth : 0 ),
          height: el.dataset.vistaviewHeight ? parseInt(el.dataset.vistaviewHeight) : ( el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).naturalHeight : 0 ),
          smallSrc: el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).src : el.dataset.vistaviewSmallsrc || el.getAttribute('src') || '',
          alt: el.querySelector('img') ? (el.querySelector('img') as HTMLImageElement).alt : el.dataset.vistaviewAlt || el.getAttribute('alt') || '',
          anchor: el instanceof HTMLAnchorElement ? el : undefined,
          image: el instanceof HTMLImageElement ? el as HTMLImageElement : 
            el.querySelector('img') ? el.querySelector('img') as HTMLImageElement : undefined
        }

      })
    }else if (Array.isArray(elements)) {
      // check for correct structure
      elements.forEach( (el, i) => {
        if( typeof el.src !== 'string') {
          throw new Error(`VistaView: Invalid src type in elements array at index ${i}. Should be a string.`);
        }
        if( typeof el.width !== 'number') {
          throw new Error(`VistaView: Invalid width type in elements array at index ${i}. Should be a number.`);
        }
        if( typeof el.height !== 'number') {
          throw new Error(`VistaView: Invalid height type in elements array at index ${i}. Should be a number.`);
        }
        if( el.alt && typeof el.alt !== 'string' ) {
          throw new Error(`VistaView: Invalid alt in elements array at index ${i}. Should be a string.`);
        }
        if( el.smallSrc && typeof el.smallSrc !== 'string' ) {
          throw new Error(`VistaView: Invalid smallSrc in elements array at index ${i}. Should be a string.`);
        }
      });
    }else{
      throw new Error('VistaView: Invalid elements option.');
    }

  }

  if(!Array.isArray(elements) || !elements.length) {
    throw new Error('VistaView: No elements found to display.');
  }

  return new VistaView(elements, {
    ...vistaViewOptionsBase
  });

}