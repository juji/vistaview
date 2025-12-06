
/// <reference types="trusted-types" />
import type { VistaViewElm } from './vista-view';

export function getElmProperties(elm: HTMLElement): VistaViewElm {
  const s = getComputedStyle(elm);
  return {
    objectFit: s.objectFit,
    borderRadius: s.borderRadius,
    objectPosition: s.objectPosition,
    overflow: s.overflow
  };
}

let cachedPolicy: TrustedTypePolicy | null = null;
function getPolicy() {
  if (cachedPolicy) return cachedPolicy;

  if (!window.trustedTypes) {
    (window as any).trustedTypes = {
      createPolicy: (_name: string, rules: any) => rules
    } as TrustedTypePolicyFactory;
  }

  cachedPolicy = window.trustedTypes!.createPolicy("vistaView-policy", {
    createHTML: (input: string) => input,
    createScript: () => { throw new Error("Not implemented"); },
    createScriptURL: () => { throw new Error("Not implemented"); }
  });

  return cachedPolicy;
}

export function createTrustedHtml(htmlString: string): DocumentFragment {
  const policy = getPolicy();
  const trustedHtml = policy.createHTML(htmlString);
  const template = document.createElement('template');
  (template as any).innerHTML = trustedHtml;
  const html = template.content;
  template.remove();
  return html;
}

export function isNotZeroCssValue(value?: string): false | string | undefined {
  return value && !/^0(px|%|r?em|vw|vh|vmin|vmax|cm|mm|in|pt|pc|ex|ch)?$/i.test(value.trim()) && value;
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