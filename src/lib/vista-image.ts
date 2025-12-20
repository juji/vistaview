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

type VistaElm = {
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
  imageElm: VistaElm;

  constructor(elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement) {
    this.original = elm;
    this.imageElm = this.constructImageElm(elm);
  }

  destroy() {
    // clean up references
    this.original = null!;
    this.imageElm = null!;
  }

  private createImgElement(attr: VistaImgAttr): HTMLImageElement {
    const img = document.createElement('img');
    img.src = attr.src;
    if (attr.alt) img.alt = attr.alt;
    if (attr.srcSet) img.srcset = attr.srcSet;
    if (attr.sizes) img.sizes = attr.sizes;
    return img;
  }

  private createPictureElement(sources: VistaPicAttr['sources'], alt?: string): HTMLPictureElement {
    const picture = document.createElement('picture');

    sources.forEach((sourceData) => {
      const source = document.createElement('source');
      source.srcset = sourceData.srcSet;
      if (sourceData.media) source.media = sourceData.media;
      if (sourceData.type) source.type = sourceData.type;
      picture.appendChild(source);
    });

    const img = document.createElement('img');
    img.src = sources.length > 0 ? sources[sources.length - 1].srcSet : '';
    if (alt) img.alt = alt;
    picture.appendChild(img);

    return picture;
  }

  getHiResElm(): HTMLImageElement | HTMLPictureElement {
    const elm = this.imageElm;
    const img = elm.img!;
    const pict = elm.picture!;

    // return existing hi-res element if already constructed
    if (elm.type === 'img' && img.elm) return img.elm;
    if (elm.type === 'picture' && pict.elm) return pict.elm;

    // construct hi-res element
    if (elm.type === 'img') {
      img.elm = this.createImgElement(img);
      return img.elm;
    }

    if (elm.type === 'picture') {
      pict.elm = this.createPictureElement(pict.sources, pict.img?.alt);
      return pict.elm;
    }

    throw new Error('Unsupported hi-res element type for VistaImage.');
  }

  getThumbElm(): HTMLImageElement | HTMLPictureElement {
    const elm = this.imageElm;

    // return existing thumb element if already constructed
    if (elm.thumb!.elm) return elm.thumb!.elm;

    // construct thumb element
    if (elm.type === 'img') {
      const thumbAttr = elm.thumb!.attributes as VistaImgAttr;
      elm.thumb!.elm = this.createImgElement(thumbAttr);
      return elm.thumb!.elm;
    }

    if (elm.type === 'picture') {
      const thumbAttr = elm.thumb!.attributes as VistaPicAttr;
      elm.thumb!.elm = this.createPictureElement(thumbAttr.sources, thumbAttr.img.alt);
      return elm.thumb!.elm;
    }

    throw new Error('Unsupported thumb element type for VistaImage.');
  }

  private getStyles(elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement): {
    borderRadius?: string;
    objectFit?: string;
  } {
    const borderRadius = getComputedStyle(elm).borderRadius;

    if (isNotZeroCssValue(borderRadius)) {
      return {
        borderRadius,
        objectFit: getComputedStyle(elm).objectFit,
      };
    }

    // Check child elements
    const child = elm.querySelector('img, picture') as HTMLImageElement | HTMLPictureElement | null;
    if (child) return this.getStyles(child);

    return {};
  }

  private getPictureSources(pictureElm: HTMLPictureElement) {
    return Array.from(pictureElm.querySelectorAll('source')).map((source) => ({
      srcSet: source.srcset,
      media: source.media,
      type: source.type,
    }));
  }

  private constructImageElm(
    elm: HTMLImageElement | HTMLAnchorElement | HTMLPictureElement
  ): VistaElm {
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
    }

    if (elm instanceof HTMLPictureElement) {
      const image = elm.querySelector('img') as HTMLImageElement | null;
      const sources = elm.dataset.vistaviewSources
        ? JSON.parse(elm.dataset.vistaviewSources)
        : this.getPictureSources(elm);

      return {
        type: 'picture',
        thumb: {
          origin: elm,
          attributes: {
            sources: this.getPictureSources(elm),
            img: {
              alt: image?.alt || '' || elm.dataset.vistaviewAlt,
            },
          },
          width: image?.width || 0,
          height: image?.height || 0,
          borderRadius: styles.borderRadius || '',
          objectFit: styles.objectFit || '',
        },
        picture: {
          sources,
          img: {
            alt: elm.dataset.vistaviewAlt || image?.alt || '',
          },
        },
      };
    }

    // Handle anchor element
    const imgChild = elm.querySelector('img') as HTMLImageElement | null;
    const pictureChild = elm.querySelector('picture') as HTMLPictureElement | null;

    if (imgChild) {
      return {
        type: 'a',
        childElm: 'img',
        anchor: { elm },
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
    }

    if (pictureChild) {
      const image = pictureChild.querySelector('img') as HTMLImageElement | null;
      const sources = elm.dataset.vistaviewSources
        ? JSON.parse(elm.dataset.vistaviewSources)
        : this.getPictureSources(pictureChild);

      return {
        type: 'a',
        childElm: 'picture',
        anchor: { elm },
        thumb: {
          origin: pictureChild,
          attributes: {
            sources: this.getPictureSources(pictureChild),
            img: {
              alt: image?.alt || '' || elm.dataset.vistaviewAlt,
            },
          },
          width: image?.width || 0,
          height: image?.height || 0,
          borderRadius: styles.borderRadius || '',
          objectFit: styles.objectFit || '',
        },
        picture: {
          sources,
          img: {
            alt: elm.dataset.vistaviewAlt || image?.alt || '',
          },
        },
      };
    }

    throw new Error('Unsupported element type for VistaImage.');
  }
}
