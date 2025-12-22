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
