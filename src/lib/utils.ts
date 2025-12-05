
/// <reference types="trusted-types" />
import DOMPurify from "isomorphic-dompurify";
import type { VistaViewElm } from './vista-view';

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

export function createTrustedHtml( htmlString: string ): DocumentFragment {
  // Check if Trusted Types is supported
  if (!window.trustedTypes) {
    (window as any).trustedTypes = {
      createPolicy: (_name: string, _rules: any) => _rules
    };
  }

  // Use Trusted Types when available
  const policy = window.trustedTypes!.createPolicy("default", {
    createHTML: (input: string) => DOMPurify.sanitize(input)
  });
  const trustedHtml = policy.createHTML(htmlString);

  // Create a template element to safely parse the TrustedHTML
  const template = document.createElement('template');
  // In browsers with Trusted Types, we need to assign the TrustedHTML to innerHTML
  (template as any).innerHTML = trustedHtml;
  return template.content;
}