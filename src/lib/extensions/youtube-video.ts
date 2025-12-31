import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

/**
 * Parse YouTube URL and extract video ID
 * Supports various YouTube URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://www.youtube.com/live/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * @param url - YouTube video URL
 * @returns Video ID or null if not found
 */
export function parseYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  // Try different YouTube URL patterns
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
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
 * Get YouTube video thumbnail URL
 * @param videoUrl - YouTube video URL
 * @param quality - Thumbnail quality: 'maxres' | 'hq' | 'mq' | 'sd' | 'default'
 * @returns Thumbnail URL
 */
export function getYouTubeThumbnail(
  videoUrl: string,
  quality: 'maxres' | 'hq' | 'mq' | 'sd' | 'default' = 'hq'
): string {
  const qualityMap = {
    maxres: 'maxresdefault.jpg',
    hq: 'hqdefault.jpg',
    mq: 'mqdefault.jpg',
    sd: 'sddefault.jpg',
    default: 'default.jpg',
  };

  const videoId = parseYouTubeVideoId(videoUrl);
  if (!videoId) {
    throw new Error('Invalid YouTube video URL');
  }

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}`;
}

export class VistaYoutubeVideo extends VistaBox {
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
    image.src = this.origin?.image.src || getYouTubeThumbnail(url, 'hq');
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
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';
      iframe.src = `https://www.youtube.com/embed/${parseYouTubeVideoId(url)}?autoplay=1&rel=0`;
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

export function youtubeVideo(): VistaExtension {
  return {
    name: 'ytVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseYouTubeVideoId(url);
      if (!videoId) return;

      return new VistaYoutubeVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaYoutubeVideo) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
