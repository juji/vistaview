import type { VistaParsedElm } from '../types';
import { isNotZeroCss } from './is-not-zero-css';

function getComputedStyleProps(elm: HTMLImageElement | HTMLAnchorElement): {
  borderRadius: string;
  objectFit: string;
} {
  const anchor = elm instanceof HTMLAnchorElement ? elm : null;
  const image = elm instanceof HTMLImageElement ? elm : anchor?.querySelector('img');
  const aStyles = anchor ? getComputedStyle(anchor) : null;
  const iStyles = image ? getComputedStyle(image) : null;

  let borderRadius = '0px';
  let objectFit = iStyles ? iStyles.objectFit : 'contain';

  if (aStyles && isNotZeroCss(aStyles.borderRadius)) {
    borderRadius = aStyles.borderRadius;
  } else if (iStyles && isNotZeroCss(iStyles.borderRadius)) {
    borderRadius = iStyles.borderRadius;
  }

  return {
    borderRadius,
    objectFit,
  };
}

function getSrcset(srcSetStr: string): { src: string; width: number }[] {
  const parts = srcSetStr.split(',').map((s) => s.trim());
  const srcset: { src: string; width: number }[] = [];

  for (const part of parts) {
    const [src, widthStr] = part.split(' ').map((s) => s.trim());
    if (src && widthStr && widthStr.endsWith('w')) {
      const width = parseInt(widthStr.slice(0, -1), 10);
      if (!isNaN(width)) {
        srcset.push({ src, width });
      }
    }
  }

  return srcset;
}

export function parseElement(elm: HTMLImageElement | HTMLAnchorElement): VistaParsedElm {
  const image = elm instanceof HTMLImageElement ? elm : elm.querySelector('img');

  const src =
    elm.dataset.vistaviewSrc ||
    elm.getAttribute('href') ||
    elm.getAttribute('src') ||
    image?.getAttribute('src') ||
    '';

  const srcSet =
    elm.dataset.vistaviewSrcset ||
    elm.getAttribute('srcset') ||
    image?.getAttribute('srcset') ||
    '';

  if (!src && !srcSet) {
    console.error('VistaView Error:', elm);
    throw new Error('VistaView: Element must have href, src, or srcSet');
  }

  const parsedSrcSet = srcSet ? getSrcset(srcSet) : undefined;

  const styles = getComputedStyleProps(elm);

  return {
    config: {
      src,
      alt: elm.dataset.vistaviewAlt || elm.getAttribute('alt') || image?.getAttribute('alt') || '',
      srcSet: srcSet || undefined,
    },
    parsedSrcSet: parsedSrcSet?.length ? parsedSrcSet : undefined,
    origin: {
      anchor: elm instanceof HTMLAnchorElement ? elm : undefined,
      image: image!,
      src,
      srcSet,
      borderRadius: styles.borderRadius,
      objectFit: styles.objectFit,
    },
  };
}
