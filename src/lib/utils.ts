
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

export function getFittedSize(img: HTMLImageElement): {
  width: number;
  height: number;
} {
  const style = window.getComputedStyle(img);
  const objectFit = style.objectFit || ""; // empty string in some old browsers

  // Rendered <img> size
  const { width: boxW, height: boxH } = img.getBoundingClientRect();

  // Natural image size
  const natW = img.naturalWidth;
  const natH = img.naturalHeight;

  // If object-fit is not supported → fallback to "fill" behavior
  if (!objectFit) {
    return { width: boxW, height: boxH };
  }

  // natural size missing (e.g., SVG, broken image)
  if (!natW || !natH) {
    return { width: boxW, height: boxH };
  }

  const imageAR = natW / natH;
  const boxAR = boxW / boxH;

  switch (objectFit) {
    case "fill":
      return { width: boxW, height: boxH };

    case "none":
      return { width: natW, height: natH };

    case "contain":
      if (imageAR > boxAR) {
        return { width: boxW, height: boxW / imageAR };
      } else {
        return { width: boxH * imageAR, height: boxH };
      }

    case "cover":
      if (imageAR < boxAR) {
        return { width: boxW, height: boxW / imageAR };
      } else {
        return { width: boxH * imageAR, height: boxH };
      }

    case "scale-down": {
      // natural size
      const natural = { width: natW, height: natH };

      // contain size
      const contain =
        imageAR > boxAR
          ? { width: boxW, height: boxW / imageAR }
          : { width: boxH * imageAR, height: boxH };

      // pick the smaller of the two
      return (contain.width <= natural.width && contain.height <= natural.height)
        ? contain
        : natural;
    }
  }

  // Unknown or non-standard object-fit → fallback
  return { width: boxW, height: boxH };
}


export function makeFullScreenContain(
  img: HTMLImageElement,
  setDataAttribute: boolean = false
) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  if (!nw || !nh) return;

  if(nw < vw && nh < vh){
    // smaller than screen, no need to resize
    img.style.width = nw + "px";
    img.style.height = nh + "px";
    return;
  }

  const imageAR = nw / nh;
  const screenAR = vw / vh;

  let width: number;
  let height: number;

  if (imageAR > screenAR) {
    // Image is wider than screen → constrain by width
    width = vw;
    height = vw / imageAR;
  } else {
    // Image is taller than screen → constrain by height
    height = vh;
    width = vh * imageAR;
  }

  // Apply size
  if(setDataAttribute) {
    img.dataset.vistaviewInitialWidth = width.toString();
    img.dataset.vistaviewInitialHeight = height.toString();
  } else {
    img.style.width = width + "px";
    img.style.height = height + "px";
  }
}