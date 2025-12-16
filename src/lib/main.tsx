import type { 
  VistaImg,
  VistaParams,
  VistaInterface,
} from "./types";

import { VistaView } from "./vista-view";

function checkElementsCorrectness(
  elements: string | NodeListOf<HTMLElement> | VistaImg[]
): string | (NodeListOf<HTMLElement> | VistaImg[]) {
  let els: NodeListOf<HTMLElement> | null = null;
  // check for correctness
  if (typeof elements === 'string') {
    els = document.querySelectorAll<HTMLElement>(elements);
  } else if (elements instanceof NodeList) {
    els = elements;
  }

  if (els) {
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      let src = el.dataset.vistaviewSrc || el.getAttribute('href') || el.getAttribute('src') || '';

      if (!src) {
        return `Element at index ${i} is missing 'src' / 'data-vistaview-src' / 'href' attribute.`;
      }
    }
  } else {
    const images = elements as VistaImg[];
    for (let i = 0; i < images.length; i++) {
      const el = images[i];
      if (!el.src) {
        return `Element at index ${i} is missing 'src' attribute.`;
      }
    }
  }

  return els || (elements as VistaImg[]);
}

export function vistaView({ elements, ...opts }: VistaParams): VistaInterface | null {
  if (!elements) throw new Error('No elements');

  let elms = checkElementsCorrectness(elements);
  if (typeof elms === 'string') {
    console.error(elms);
    console.warn('VistaView: silently returning.');
    return null;
  }

  const v = new VistaView(elms, opts);

  return {
    open: (startIndex = 0) => v.open(startIndex),
    close: () => v.close(),
    next: () => v.next(),
    prev: () => v.prev(),
    destroy: () => v.destroy(),
    getCurrentIndex: () => v.getCurrentIndex(),
    view: (index: number) => {
      v.view(index);
    },
  };
}
