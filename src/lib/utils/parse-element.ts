import type { VistaImgConfig, VistaImgOrigin } from '../types';
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

export function parseElement(elm: HTMLImageElement | HTMLAnchorElement): {
  config: VistaImgConfig;
  origin: VistaImgOrigin;
} {
  const image = elm instanceof HTMLImageElement ? elm : elm.querySelector('img');

  const src =
    elm.dataset.vistaviewSrc ||
    elm.getAttribute('href') ||
    elm.getAttribute('src') ||
    image?.getAttribute('src') ||
    '';

  const srcSet =
    elm.dataset.vistaviewSrcSet ||
    elm.getAttribute('srcset') ||
    image?.getAttribute('srcset') ||
    '';

  if (!src && !srcSet) {
    console.error('VistaView Error:', elm);
    throw new Error('VistaView: Element must have href, src, or srcSet');
  }

  const styles = getComputedStyleProps(elm);

  return {
    config: {
      src,
      alt: elm.getAttribute('alt') || image?.getAttribute('alt') || '',
      srcSet: srcSet || undefined,
    },
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
