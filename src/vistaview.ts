import { VistaView, DefaultOptions } from './lib/vista-view';
import { getDownloadButton } from './lib/components';
import type {
  VistaViewImage,
  VistaViewElm,
  VistaViewOptions as VistaViewOptionsBase,
} from './lib/vista-view';
import './style.css';

export type { VistaViewImage, VistaViewElm, VistaViewOptionsBase };
export { DefaultOptions, getDownloadButton };

export type VistaViewOptions = {
  parent?: HTMLElement;
  elements?: string | NodeListOf<HTMLElement> | VistaViewImage[];
} & VistaViewOptionsBase;

// Helper to convert HTML element to VistaViewImage
const toImage = (el: HTMLElement): VistaViewImage => {
  const img =
    el instanceof HTMLImageElement ? el : (el.querySelector('img') as HTMLImageElement | null);
  return {
    src: el.dataset.vistaviewSrc || el.getAttribute('href') || '',
    width: +(el.dataset.vistaviewWidth || img?.naturalWidth || 0),
    height: +(el.dataset.vistaviewHeight || img?.naturalHeight || 0),
    smallSrc: img?.src || el.dataset.vistaviewSmallsrc || el.getAttribute('src') || '',
    alt: img?.alt || el.dataset.vistaviewAlt || el.getAttribute('alt') || '',
    anchor: el instanceof HTMLAnchorElement ? el : undefined,
    image: img || undefined,
  };
};

export function vistaView({ parent, elements, ...opts }: VistaViewOptions): VistaView {
  if (!parent && !elements) throw new Error('No parent or elements');

  let imgs: VistaViewImage[];

  if (parent) {
    const sel = parent.querySelector('img[data-vistaview-src]')
      ? 'img[data-vistaview-src]'
      : 'a[href]';
    imgs = Array.from(parent.querySelectorAll<HTMLElement>(sel)).map(toImage);
  } else if (typeof elements === 'string') {
    imgs = Array.from(document.querySelectorAll<HTMLElement>(elements)).map(toImage);
  } else if (elements instanceof NodeList) {
    imgs = Array.from(elements).map(toImage);
  } else if (Array.isArray(elements)) {
    imgs = elements;
  } else {
    throw new Error('Invalid elements');
  }

  if (!imgs.length) throw new Error('No elements found');

  return new VistaView(imgs, opts);
}
