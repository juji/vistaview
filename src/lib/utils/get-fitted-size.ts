// this function calculates the rendered size of an image element
// according to its CSS object-fit property
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
