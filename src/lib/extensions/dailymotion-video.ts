import type { VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';

/**
 * Parse Dailymotion URL and extract video ID
 * Supports various Dailymotion URL formats:
 * - https://www.dailymotion.com/video/VIDEO_ID
 * - https://dai.ly/VIDEO_ID
 * - https://www.dailymotion.com/embed/video/VIDEO_ID
 * @param url - Dailymotion video URL
 * @returns Video ID or null if not found
 */
export function parseDailymotionVideoId(url: string): string | null {
  if (!url) return null;

  // Try different Dailymotion URL patterns
  const patterns = [
    /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
    /dai\.ly\/([a-zA-Z0-9]+)/,
    /dailymotion\.com\/embed\/video\/([a-zA-Z0-9]+)/,
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
 * Get Dailymotion video thumbnail URL
 * @param videoUrl - Dailymotion video URL
 * @param quality - Thumbnail quality: 'large' | 'medium' | 'small'
 * @returns Thumbnail URL
 */
export function getDailymotionThumbnail(videoUrl: string): string {
  const videoId = parseDailymotionVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid Dailymotion video URL');
  }

  // Dailymotion thumbnail URL pattern
  return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
}

export class VistaDailymotionVideo extends VistaBox {
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
    image.src = this.origin?.image.src || getDailymotionThumbnail(url);
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
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
      iframe.src = `https://www.dailymotion.com/embed/video/${parseDailymotionVideoId(url)}?autoplay=1`;
      div.appendChild(iframe);

      iframe.onload = () => {
        iframe.style.opacity = '1';
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

export function dailymotionVideo(): VistaExtension {
  return {
    name: 'dailymotionVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseDailymotionVideoId(url);
      if (!videoId) return;

      return new VistaDailymotionVideo(params);
    },
  };
}
