import { isNotZeroCss } from './is-not-zero-css';

export function getStyle(elm: HTMLImageElement | HTMLAnchorElement): {
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
