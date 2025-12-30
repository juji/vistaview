import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

/**
 * Parse Wistia URL and extract video ID
 * Supports various Wistia URL formats:
 * - https://home.wistia.com/medias/VIDEO_ID
 * - https://fast.wistia.net/embed/iframe/VIDEO_ID
 * - https://ACCOUNT.wistia.com/medias/VIDEO_ID
 * @param url - Wistia video URL
 * @returns Video ID or null if not found
 */
export function parseWistiaVideoId(url: string): string | null {
  if (!url) return null;

  // Try different Wistia URL patterns
  const patterns = [
    /wistia\.com\/medias\/([a-zA-Z0-9]+)/,
    /wistia\.net\/embed\/iframe\/([a-zA-Z0-9]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get Wistia video thumbnail URL using oEmbed API
 * Note: This fetches data asynchronously from Wistia's oEmbed endpoint
 * @param videoUrl - Wistia video URL
 * @returns Promise with thumbnail URL
 */
export async function getWistiaThumbnail(videoUrl: string): Promise<string> {
  const videoId = parseWistiaVideoId(videoUrl);

  if (!videoId) {
    throw new Error('Invalid Wistia video URL');
  }

  try {
    const response = await fetch(
      `https://fast.wistia.com/oembed?url=https://home.wistia.com/medias/${videoId}`
    );
    const data = await response.json();
    return data.thumbnail_url;
  } catch (error) {
    // Fallback: return a placeholder or rethrow
    console.error('Failed to fetch Wistia thumbnail:', error);
    throw new Error('Failed to fetch Wistia thumbnail');
  }
}

export class VistaWistiaVideo extends VistaBox {
  element: HTMLDivElement | HTMLImageElement;
  url: string;

  constructor(par: VistaImageParams) {
    super(par);

    const url = par.elm.config.src;
    this.url = url;

    const div = document.createElement('div');
    div.style.position = 'relative';
    const image = document.createElement('img');
    div.appendChild(image);
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.src = this.origin?.image.src || ''; // use existing thumbnail if available
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
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';
      iframe.src = `https://fast.wistia.net/embed/iframe/${parseWistiaVideoId(url)}?autoPlay=1`;
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

export function wistiaVideo(): VistaExtension {
  return {
    name: 'wistiaVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseWistiaVideoId(url);
      if (!videoId) return;

      return new VistaWistiaVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaWistiaVideo) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut']);
      }
    },
  };
}
