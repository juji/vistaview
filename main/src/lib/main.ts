import type { VistaInterface, VistaImgConfig, VistaParams } from './types';

import { VistaView } from './vista-view';

function checkCorrectness(elements: string | VistaImgConfig[]): string | VistaImgConfig[] | Error {
  let els: NodeListOf<HTMLElement> | null = null;

  // get elements as node list
  if (typeof elements === 'string') {
    els = document.querySelectorAll<HTMLElement>(elements);

    if (els.length === 0) {
      return new Error('No elements found in node list.').toString();
    }

    // Validate DOM elements - must be img or a
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      const tagName = el.tagName.toLowerCase();

      if (tagName !== 'img' && tagName !== 'a') {
        return new Error(`Invalid element at index ${i}: expected <img>, <a>, got <${tagName}>`);
      }

      // If anchor, must contain img
      if (tagName === 'a') {
        const hasImg = el.querySelector('img') !== null;
        if (!hasImg) {
          return new Error(`Invalid <a> element at index ${i}: must contain <img>`);
        }
      }
    }
  } else {
    // Validate VistaImgConfig array
    const data = elements as VistaImgConfig[];

    for (let i = 0; i < data.length; i++) {
      const img = data[i];

      if (!img.src) {
        return new Error(`Invalid image data at index ${i}: must have 'src'`);
      }
    }
  }

  return elements;
}

export function vistaView({ elements, ...opts }: VistaParams): VistaInterface | null {
  if (!elements) {
    console.error(elements);
    console.error('no elements provided');
    console.warn('VistaView: silently returning.');
    return null;
  }

  let elms = checkCorrectness(elements);
  if (elms instanceof Error) {
    console.error(elms);
    console.warn('VistaView: silently returning.');
    return null;
  }

  const v = new VistaView(elms, opts);

  return {
    open: (startIndex = 0) => v.open(startIndex),
    reset: () => v.reset(),
    close: () => v.close(),
    next: () => v.next(),
    prev: () => v.prev(),
    zoomIn: () => v.zoomIn(),
    zoomOut: () => v.zoomOut(),
    destroy: () => v.destroy(),
    getCurrentIndex: () => v.getCurrentIndex(),
    view: (index: number) => {
      v.view(index);
    },
  };
}
