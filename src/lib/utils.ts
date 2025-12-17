import type { VistaElmProps, VistaImgIdx } from './types';

export function isNotZeroCssValue(value?: string): false | string | undefined {
  return (
    value && !/^0(px|%|r?em|vw|vh|vmin|vmax|cm|mm|in|pt|pc|ex|ch)?$/i.test(value.trim()) && value
  );
}

export function getFittedSize(img: HTMLImageElement): {
  width: number;
  height: number;
} {
  const style = window.getComputedStyle(img);
  const objectFit = style.objectFit || ''; // empty string in some old browsers

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
    case 'fill':
      return { width: boxW, height: boxH };

    case 'none':
      return { width: natW, height: natH };

    case 'contain':
      if (imageAR > boxAR) {
        return { width: boxW, height: boxW / imageAR };
      } else {
        return { width: boxH * imageAR, height: boxH };
      }

    case 'cover':
      if (imageAR < boxAR) {
        return { width: boxW, height: boxW / imageAR };
      } else {
        return { width: boxH * imageAR, height: boxH };
      }

    case 'scale-down': {
      // natural size
      const natural = { width: natW, height: natH };

      // contain size
      const contain =
        imageAR > boxAR
          ? { width: boxW, height: boxW / imageAR }
          : { width: boxH * imageAR, height: boxH };

      // pick the smaller of the two
      return contain.width <= natural.width && contain.height <= natural.height ? contain : natural;
    }
  }

  // Unknown or non-standard object-fit → fallback
  return { width: boxW, height: boxH };
}

export function getElmProperties(elm: HTMLElement): VistaElmProps {
  const s = getComputedStyle(elm);
  const pos = elm.getBoundingClientRect();
  return {
    objectFit: s.objectFit,
    borderRadius: s.borderRadius,
    objectPosition: s.objectPosition,
    overflow: s.overflow,
    top: pos.top,
    left: pos.left,
    width: pos.width,
    height: pos.height,
    naturalWidth: (elm as HTMLImageElement).naturalWidth,
    naturalHeight: (elm as HTMLImageElement).naturalHeight,
  };
}

export function getElmProps(el: VistaImgIdx): {
  fit: string;
  pos: string;
  br: string;
  overflow: string;
  nw: number;
  nh: number;
  w: number;
  h: number;
  top: number;
  left: number;
} {
  const imageProps = el.imageElm ? getElmProperties(el.imageElm) : null;
  const anchorProps = el.anchorElm ? getElmProperties(el.anchorElm) : null;

  const isNotZeroRadiusImg = isNotZeroCssValue(imageProps?.borderRadius);
  const isNotZeroRadiusAnchor = anchorProps && isNotZeroCssValue(anchorProps?.borderRadius);
  const br =
    (isNotZeroRadiusAnchor
      ? anchorProps?.borderRadius
      : isNotZeroRadiusImg
        ? imageProps?.borderRadius
        : '') || '';

  return {
    fit: imageProps?.objectFit || anchorProps?.objectFit || '',
    pos: imageProps?.objectPosition || '',
    br,
    overflow: isNotZeroRadiusAnchor
      ? anchorProps!.overflow
      : isNotZeroRadiusImg
        ? imageProps!.overflow
        : '',
    nw: imageProps?.naturalWidth || 0,
    nh: imageProps?.naturalHeight || 0,
    w: anchorProps?.width || imageProps?.width || 0,
    h: anchorProps?.height || imageProps?.height || 0,
    top: anchorProps?.top || imageProps?.top || 0,
    left: anchorProps?.left || imageProps?.left || 0,
  };
}

export function setImageStyles(
  el: VistaImgIdx,
  hi: HTMLImageElement,
  lo: HTMLImageElement,
  init: boolean = false
) {
  const {
    fit,
    w,
    h,
    // this ones makes things hard. not used.
    // pos,
    // overflow,
    nw,
    nh,
    br,
    top,
    left,
  } = getElmProps(el);

  // Calculate translation values, clamped within viewport + image size
  // there is a bug when the address bar in mobile browser shows
  // the viewport height changes, and it's not reflected in translateTop calculation

  const translateLeft =
    Math.min(Math.max(left, -w), window.innerWidth + w) - window.innerWidth / 2 + w / 2;
  const translateTop =
    Math.min(Math.max(top, -h), window.innerHeight + h) - window.innerHeight / 2 + h / 2;

  const ls = lo.style;
  ls.width = `${w}px`;
  ls.height = `${h}px`;
  ls.objectFit = fit;
  lo.width = nw;
  lo.height = nh;
  ls.setProperty('--vvw-init-radius', `${br}`);
  ls.setProperty('--vvw-pulse-radius', `calc(1.3 * ${br})`);
  ls.setProperty('--vvw-init-x', `${translateLeft}px`);
  ls.setProperty('--vvw-init-y', `${translateTop}px`);
  if (init) {
    ls.setProperty('--vvw-current-x', `${translateLeft}px`);
    ls.setProperty('--vvw-current-y', `${translateTop}px`);
  }

  const fittedSize = getFittedSize(el.imageElm!);
  const hiWidth = Math.min(w, fittedSize.width);
  const hiHeight = Math.min(h, fittedSize.height);

  const hs = hi.style;
  hs.setProperty('--vvw-init-radius', `${br}`);
  hs.setProperty('--vvw-init-w', `${hiWidth}px`);
  hs.setProperty('--vvw-init-h', `${hiHeight}px`);
  if (init) {
    hs.setProperty('--vvw-current-radius', `${br}`);
    hs.setProperty('--vvw-current-w', `${hiWidth}px`);
    hs.setProperty('--vvw-current-h', `${hiHeight}px`);
  }
}

export function getFullSizeDim(img: HTMLImageElement): {
  width: number;
  height: number;
} {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const nw = img.naturalWidth;
  const nh = img.naturalHeight;

  if (!nw || !nh) {
    console.error('Error', img);
    throw new Error('Image natural dimensions are zero');
  }

  if (nw < vw && nh < vh) {
    // smaller than screen, no need to resize
    return {
      width: nw,
      height: nh,
    };
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

  return {
    width,
    height,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function limitPrecision(value: number, precision: number = 3): number {
  const factor = Math.pow(10, precision);
  return Math.round(value * factor) / factor;
}
