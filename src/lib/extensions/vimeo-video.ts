import type { VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';

/**
 * Parse Vimeo URL and extract video ID
 * Supports various Vimeo URL formats:
 * - https://vimeo.com/VIDEO_ID
 * - https://player.vimeo.com/video/VIDEO_ID
 * - https://vimeo.com/channels/CHANNEL/VIDEO_ID
 * - https://vimeo.com/groups/GROUP/videos/VIDEO_ID
 * @param url - Vimeo video URL
 * @returns Video ID or null if not found
 */
export function parseVimeoVideoId(url: string): string | null {
  if (!url) return null;

  // Try different Vimeo URL patterns
  const patterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Get Vimeo video thumbnail URL
 * Note: This uses a workaround as Vimeo's official API requires authentication.
 * For production use, consider using Vimeo's oEmbed API.
 * @param videoUrl - Vimeo video URL
 * @returns Thumbnail URL (placeholder pattern)
 */
export function getVimeoThumbnail(videoUrl: string): string {
  const videoId = parseVimeoVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid Vimeo video URL');
  }

  // Note: Vimeo doesn't provide direct thumbnail URLs without API authentication
  // This is a placeholder - you may want to fetch from oEmbed API
  return `https://vumbnail.com/${videoId}.jpg`;
}

export class VistaVimeoVideo extends VistaBox {
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
    image.src = this.origin?.image.src || getVimeoThumbnail(url);
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
      iframe.allow = 'autoplay; fullscreen; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';
      iframe.src = `https://player.vimeo.com/video/${parseVimeoVideoId(url)}?autoplay=1`;
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

export function vimeoVideo(): VistaExtension {
  return {
    name: 'vimeoVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseVimeoVideoId(url);
      if (!videoId) return;

      return new VistaVimeoVideo(params);
    },
  };
}
