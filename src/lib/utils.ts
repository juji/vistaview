
/// <reference types="trusted-types" />
import DOMPurify from "isomorphic-dompurify";
import type { VistaViewElm } from './vista-view';

export function getElmProperties( elm: HTMLElement ): VistaViewElm {

  const objectFit = window.getComputedStyle( elm ).getPropertyValue( 'object-fit' );
  const borderRadius = window.getComputedStyle( elm ).getPropertyValue( 'border-radius' );
  const objectPosition = window.getComputedStyle( elm ).getPropertyValue( 'object-position' );
  const overflow = window.getComputedStyle( elm ).getPropertyValue( 'overflow' );

  return {
    objectFit,
    borderRadius,
    objectPosition,
    overflow
  };
}

let cachedPolicy: TrustedTypePolicy | null = null;
function getPolicy(){

  if(cachedPolicy){
    return cachedPolicy;
  }

  // Check if Trusted Types is supported
  if (!window.trustedTypes) {
    (window as any).trustedTypes = {
      createPolicy: (_name: string, _rules: any) => _rules
    } as TrustedTypePolicyFactory;
  }

  // Use default policy - Trusted Types will return existing policy if name already exists
  cachedPolicy = window.trustedTypes!.createPolicy("vistaView-policy", {
    createHTML: (input: string) => DOMPurify.sanitize(input),
    createScript: (_input: string) => { throw new Error("createScript not implemented"); },
    createScriptURL: (_input: string) => { throw new Error("createScriptURL not implemented"); }
  });

  return cachedPolicy;
}

export function createTrustedHtml( htmlString: string ): DocumentFragment {
  // Check if Trusted Types is supported
  if (!window.trustedTypes) {
    (window as any).trustedTypes = {
      createPolicy: (_name: string, _rules: any) => _rules
    };
  }

  // Use default policy - Trusted Types will return existing policy if name already exists
  const policy = getPolicy();

  const trustedHtml = policy.createHTML(htmlString);

  // Create a template element to safely parse the TrustedHTML
  const template = document.createElement('template');
  (template as any).innerHTML = trustedHtml;
  const html = template.content;
  template.remove();
  return html;
}

export function isNotZeroCssValue( value?: string ): false | string | undefined {
  const zeroValues = ['0', '0px', '0%', '0em', '0rem', '0vw', '0vh', '0vmin', '0vmax', '0cm', '0mm', '0in', '0pt', '0pc', '0ex', '0ch'];
  const isZero = value ? zeroValues.includes( value?.trim().toLowerCase() || '' ) : value;
  return isZero ? false : value;
}