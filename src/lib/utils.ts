
import type { VistaViewElm } from './VistaView.js';

export function getElmProperties( elm: HTMLElement ): VistaViewElm {

  const objectFit = window.getComputedStyle( elm ).getPropertyValue( 'object-fit' );
  const borderRadius = window.getComputedStyle( elm ).getPropertyValue( 'border-radius' );
  const objectPosition = window.getComputedStyle( elm ).getPropertyValue( 'object-position' );
  const overflow = window.getComputedStyle( elm ).getPropertyValue( 'overflow' );
  const rect = elm.getBoundingClientRect();

  return { 
    width: elm instanceof HTMLImageElement ? elm.width : rect.width,
    height: elm instanceof HTMLImageElement ? elm.height : rect.height,
    naturalWidth: elm instanceof HTMLImageElement ? elm.naturalWidth : rect.width,
    naturalHeight: elm instanceof HTMLImageElement ? elm.naturalHeight : rect.height,
    objectFit,
    borderRadius,
    objectPosition,
    overflow
  };
}
