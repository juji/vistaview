import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

/**
 * Parse Streamable URL and extract video ID
 * Supports various Streamable URL formats:
 * - https://streamable.com/VIDEO_ID
 * - https://streamable.com/e/VIDEO_ID
 * @param url - Streamable video URL
 * @returns Video ID or null if not found
 */
export function parseStreamableVideoId(url: string): string | null {
  if (!url) return null;

  // Try different Streamable URL patterns
  const patterns = [/streamable\.com\/e\/([a-zA-Z0-9]+)/, /streamable\.com\/([a-zA-Z0-9]+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get Streamable video thumbnail URL
 * @param videoUrl - Streamable video URL
 * @returns Thumbnail URL
 */
export function getStreamableThumbnail(videoUrl: string): string {
  const videoId = parseStreamableVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid Streamable video URL');
  }

  return `https://cdn-cf-east.streamable.com/image/${videoId}.jpg`;
}

export class VistaStreamableVideo extends VistaBox {
  element: HTMLDivElement;
  url: string;

  constructor(par: VistaImageParams) {
    super(par);

    const url = par.elm.config.src;
    this.url = url;

    const div = document.createElement('div');
    div.style.position = 'relative';
    const image = document.createElement('img');
    div.appendChild(image);
    image.src = this.origin?.image.src || getStreamableThumbnail(url);
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.classList.add('vvw--pulsing');

    this.element = div;

    this.element.classList.add('vvw-img-hi');

    // set sizes
    const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5;
    this.maxW = this.fullW; // no scaling
    this.element.style.width = `${fullWidth}px`;
    this.element.style.height = `${fullHeight}px`;

    // trigger setSizes to setup thumb and iframe initial style
    this.setSizes({ stableSize: false, initDimension: true });

    if (this.pos === 0) {
      const iframe = document.createElement('iframe');
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay; fullscreen';
      iframe.allowFullscreen = true;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.backgroundColor = 'transparent';
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';
      iframe.src = `https://streamable.com/e/${parseStreamableVideoId(url)}?autoplay=1`;
      div.appendChild(iframe);

      iframe.onload = () => {
        iframe.style.opacity = '1';
        image.classList.remove('vvw--pulsing');
      };
    }

    this.isLoadedResolved!(true);
  }

  // the default full size is the scaled thumbnail size
  // so we change it to 16:9 full window width size (or max 800px)
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, 800);
    return {
      width: maxWidth,
      height: (maxWidth * 9) / 16,
    };
  }

  // override to avoid propagating content change event
  // (because no change will happen on iframe)
  setFinalTransform() {
    return super.setFinalTransform({ propagateEvent: false });
  }
}

export function streamableVideo(): VistaExtension {
  return {
    name: 'streamableVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseStreamableVideoId(url);
      if (!videoId) return;

      return new VistaStreamableVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaStreamableVideo) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
