import { isNotZeroCssValue } from './utils';

type VistaImgAttr = {
  elm?: HTMLImageElement;
  src: string;
  alt?: string;
  srcSet?: string;
  sizes?: string;
};

type VistaPicAttr = {
  elm?: HTMLPictureElement;
  sources: {
    srcSet: string;
    media?: string;
    type?: string;
  }[];
  img: {
    alt?: string;
  };
};

type VistaImageElm = {
  type: 'img' | 'a' | 'picture';
  childElm?: 'img' | 'picture';
  thumb?: {
    origin: HTMLImageElement | HTMLPictureElement;
    elm?: HTMLImageElement | HTMLPictureElement;
    attributes: VistaImgAttr | VistaPicAttr;
    width: number;
    height: number;
    borderRadius: string;
    objectFit: string;
  };

  img?: VistaImgAttr;

  anchor?: {
    elm: HTMLAnchorElement;
  };

  picture?: VistaPicAttr;
};

export class VistaImage {
  original: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement;
  imageElm: VistaImageElm;

  constructor(elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement) {
    this.original = elm;
    this.imageElm = this.constructImageElm(elm);
  }

  destroy() {
    // clean up references
    this.original = null!;
    this.imageElm = null!;
  }

  getHiResElm(): HTMLImageElement | HTMLPictureElement {
    const elm = this.imageElm;
    const img = elm.img!;
    const pict = elm.picture!;

    // return existing hi-res element if already constructed
    if (elm.type === 'img' && img.elm) {
      return img.elm;
    } else if (elm.type === 'picture' && pict.elm) {
      return pict.elm;
    }

    // construct hi-res element
    if (elm.type === 'img') {
      const im = document.createElement('img');
      im.src = img.src;

      if (img.alt) im.alt = img.alt!;
      if (img.srcSet) im.srcset = img.srcSet!;
      if (img.sizes) im.sizes = img.sizes!;

      img.elm = im;
      return im;
    } else if (elm.type === 'picture') {
      const picture = document.createElement('picture');
      const sources = elm.picture!.sources;

      sources.forEach((sourceData) => {
        const source = document.createElement('source');
        source.srcset = sourceData.srcSet;
        if (sourceData.media) source.media = sourceData.media;
        if (sourceData.type) source.type = sourceData.type;
        picture.appendChild(source);
      });

      const im = document.createElement('img');
      im.src = sources.length > 0 ? sources[sources.length - 1].srcSet : '';
      if (pict.img?.alt) im.alt = pict.img.alt;
      picture.appendChild(im);

      pict.elm = picture;
      return picture;
    }

    throw new Error('Unsupported hi-res element type for VistaImage.');
  }

  getThumbElm(): HTMLImageElement | HTMLPictureElement {
    const elm = this.imageElm;

    // return existing thumb element if already constructed
    if (elm.thumb!.elm) {
      return elm.thumb!.elm;
    }

    // construct thumb element

    if (elm.type === 'img') {
      const thumbAttr = elm.thumb!.attributes as VistaImgAttr;
      const img = document.createElement('img');
      img.src = thumbAttr.src;

      if (thumbAttr.alt) img.alt = thumbAttr.alt!;
      if (thumbAttr.srcSet) img.srcset = thumbAttr.srcSet!;
      if (thumbAttr.sizes) img.sizes = thumbAttr.sizes!;

      elm.thumb!.elm = img;
      return img;
    } else if (elm.type === 'picture') {
      const thumbAttr = elm.thumb!.attributes as VistaPicAttr;
      const picture = document.createElement('picture');
      const sources = thumbAttr.sources;
      const imageAlt = thumbAttr.img.alt || '';

      sources.forEach((sourceData) => {
        const source = document.createElement('source');
        source.srcset = sourceData.srcSet;
        if (sourceData.media) source.media = sourceData.media;
        if (sourceData.type) source.type = sourceData.type;
        picture.appendChild(source);
      });

      const img = document.createElement('img');
      img.src = sources.length > 0 ? sources[sources.length - 1].srcSet : '';
      img.alt = imageAlt;

      picture.appendChild(img);

      elm.thumb!.elm = picture;
      return picture;
    }

    throw new Error('Unsupported thumb element type for VistaImage.');
  }

  private getStyles(elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement): {
    borderRadius?: string;
    objectFit?: string;
  } {
    if (elm instanceof HTMLImageElement) {
      const borderRadius = getComputedStyle(elm).borderRadius;

      if (isNotZeroCssValue(borderRadius)) {
        return {
          borderRadius: borderRadius,
          objectFit: getComputedStyle(elm).objectFit,
        };
      }

      return {};
    } else if (elm instanceof HTMLPictureElement) {
      const elmBorderRadius = getComputedStyle(elm).borderRadius;

      if (isNotZeroCssValue(elmBorderRadius)) {
        return {
          borderRadius: elmBorderRadius,
          objectFit: getComputedStyle(elm).objectFit,
        };
      }

      const image = elm.querySelector('img') as HTMLImageElement | null;
      const styles = image ? this.getStyles(image) : { borderRadius: '', objectFit: '' };

      if (styles.borderRadius && isNotZeroCssValue(styles.borderRadius)) {
        return styles;
      }

      return {};
    } else if (elm instanceof HTMLAnchorElement) {
      const elmBorderRadius = getComputedStyle(elm).borderRadius;

      if (isNotZeroCssValue(elmBorderRadius)) {
        return {
          borderRadius: elmBorderRadius,
          objectFit: getComputedStyle(elm).objectFit,
        };
      }

      const imgChild = elm.querySelector('img') as HTMLImageElement | null;
      let styles = imgChild ? this.getStyles(imgChild) : { borderRadius: '', objectFit: '' };
      if (styles.borderRadius && isNotZeroCssValue(styles.borderRadius)) {
        return styles;
      }

      const pictureChild = elm.querySelector('picture') as HTMLPictureElement | null;
      styles = pictureChild ? this.getStyles(pictureChild) : { borderRadius: '', objectFit: '' };
      if (styles.borderRadius && isNotZeroCssValue(styles.borderRadius)) {
        return styles;
      }

      return {};
    }

    return {};
  }

  private constructImageElm(
    elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement
  ): VistaImageElm {
    const styles = this.getStyles(elm);

    if (elm instanceof HTMLImageElement) {
      return {
        type: 'img',
        thumb: {
          origin: elm,
          attributes: {
            src: elm.src,
            alt: elm.alt,
            srcSet: elm.srcset,
            sizes: elm.sizes,
          },
          width: elm.width,
          height: elm.height,
          borderRadius: styles.borderRadius || '',
          objectFit: styles.objectFit || '',
        },
        img: {
          src: elm.dataset.vistaviewSrc || elm.src,
          alt: elm.dataset.vistaviewAlt || elm.alt,
          srcSet: elm.dataset.vistaviewSrcSet || elm.srcset,
          sizes: elm.dataset.vistaviewSizes || elm.sizes,
        },
      };
    } else if (elm instanceof HTMLAnchorElement) {
      const imgChild = elm.querySelector('img') as HTMLImageElement | null;
      const pictureChild = elm.querySelector('picture') as HTMLPictureElement | null;

      if (imgChild) {
        return {
          type: 'a',
          childElm: 'img',
          anchor: {
            elm: elm,
          },
          thumb: {
            origin: imgChild,
            attributes: {
              src: imgChild.src,
              alt: imgChild.alt,
              srcSet: imgChild.srcset,
              sizes: imgChild.sizes,
            },
            width: imgChild.width,
            height: imgChild.height,
            borderRadius: styles.borderRadius || '',
            objectFit: styles.objectFit || '',
          },
          img: {
            src: elm.dataset.vistaviewSrc || elm.getAttribute('href') || imgChild.src,
            alt: elm.dataset.vistaviewAlt || imgChild.alt,
            srcSet: elm.dataset.vistaviewSrcSet || imgChild.srcset,
            sizes: elm.dataset.vistaviewSizes || imgChild.sizes,
          },
        };
      } else if (pictureChild) {
        const image = pictureChild.querySelector('img') as HTMLImageElement | null;
        const sources = elm.dataset.vistaviewSources
          ? JSON.parse(elm.dataset.vistaviewSources)
          : null;
        const pictSources = Array.from(pictureChild.querySelectorAll('source')).map((source) => ({
          srcSet: source.srcset,
          media: source.media,
          type: source.type,
        }));

        return {
          type: 'a',
          childElm: 'picture',
          anchor: {
            elm: elm,
          },
          thumb: {
            origin: pictureChild,
            attributes: {
              sources: pictSources,
              img: {
                alt: (image ? image.alt : '') || elm.dataset.vistaviewAlt,
              },
            },
            width: image?.width || 0,
            height: image?.height || 0,
            borderRadius: styles.borderRadius || '',
            objectFit: styles.objectFit || '',
          },
          picture: {
            sources: sources || pictSources,
            img: {
              alt: elm.dataset.vistaviewAlt || (image ? image.alt : ''),
            },
          },
        };
      }
    } else if (elm instanceof HTMLPictureElement) {
      const image = elm.querySelector('img') as HTMLImageElement | null;
      const sources = elm.dataset.vistaviewSources
        ? JSON.parse(elm.dataset.vistaviewSources)
        : null;
      const pictSources = Array.from(elm.querySelectorAll('source')).map((source) => ({
        srcSet: source.srcset,
        media: source.media,
        type: source.type,
      }));

      return {
        type: 'picture',
        thumb: {
          origin: elm,
          attributes: {
            sources: pictSources,
            img: {
              alt: (image ? image.alt : '') || elm.dataset.vistaviewAlt,
            },
          },
          width: image?.width || 0,
          height: image?.height || 0,
          borderRadius: styles.borderRadius || '',
          objectFit: styles.objectFit || '',
        },
        picture: {
          sources: sources || pictSources,
          img: {
            alt: elm.dataset.vistaviewAlt || (image ? image.alt : ''),
          },
        },
      };
    }

    throw new Error('Unsupported element type for VistaImage.');
  }
}
