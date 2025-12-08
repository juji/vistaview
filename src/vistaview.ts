import { VistaView, DefaultOptions } from './lib/vista-view';
import { vistaViewDownload } from './lib/components';
import type { VistaViewImage, VistaViewOptions as VistaViewOptionsBase } from './lib/types';
import './style.css';

export type { VistaViewImage, VistaViewOptionsBase };
export { DefaultOptions, vistaViewDownload };

export type VistaViewOptions = {
  elements: string | NodeListOf<HTMLElement> | VistaViewImage[];
} & VistaViewOptionsBase;

export type VistaViewInterface = {
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  destroy: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

function checkElementsCorrectness(
  elements: string | NodeListOf<HTMLElement> | VistaViewImage[]
): string | (NodeListOf<HTMLElement> | VistaViewImage[]) {
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
    const images = elements as VistaViewImage[];
    for (let i = 0; i < images.length; i++) {
      const el = images[i];
      if (!el.src) {
        return `Element at index ${i} is missing 'src' attribute.`;
      }
    }
  }

  return els || (elements as VistaViewImage[]);
}

export function vistaView({ elements, ...opts }: VistaViewOptions): VistaViewInterface | null {
  if (!elements) throw new Error('No elements');

  let elms = checkElementsCorrectness(elements);
  if (typeof elms === 'string') {
    console.error(elms);
    console.warn('VistaView: silently returning.');
    return null;
  }

  const vv = new VistaView(elms, opts);

  return {
    open: (startIndex = 0) => vv.open(startIndex),
    close: () => vv.close(),
    next: () => vv.next(),
    prev: () => vv.prev(),
    destroy: () => vv.destroy(),
    getCurrentIndex: () => vv.getCurrentIndex(),
    view: (index: number) => {
      vv.view(index);
    },
  };
}
