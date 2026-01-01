import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

/**
 * Parse Twitch URL and extract video ID or channel
 * Supports:
 * - https://www.twitch.tv/videos/VIDEO_ID
 * - https://www.twitch.tv/CHANNEL
 * @param url - Twitch video or channel URL
 * @returns Object with type ('video' or 'channel') and id
 */
export function parseTwitchUrl(url: string): { type: 'video' | 'channel'; id: string } | null {
  if (!url) return null;

  // Video URL: https://www.twitch.tv/videos/VIDEO_ID
  const videoMatch = url.match(/twitch\.tv\/videos\/(\d+)/);
  if (videoMatch) {
    return { type: 'video', id: videoMatch[1] };
  }

  // Channel URL: https://www.twitch.tv/CHANNEL
  const channelMatch = url.match(/twitch\.tv\/([^/?]+)/);
  if (channelMatch && channelMatch[1] !== 'videos') {
    return { type: 'channel', id: channelMatch[1] };
  }

  return null;
}

/**
 * Get Twitch thumbnail URL
 * @param url - Twitch URL
 * @returns Thumbnail URL
 */
export function getTwitchThumbnail(url: string): string {
  const parsed = parseTwitchUrl(url);
  if (!parsed) {
    throw new Error('Invalid Twitch URL');
  }

  if (parsed.type === 'channel') {
    // Live stream thumbnail
    return `https://static-cdn.jtvnw.net/previews-ttv/live_user_${parsed.id}-320x180.jpg`;
  } else {
    // VOD thumbnail (approximate)
    return `https://static-cdn.jtvnw.net/cf_vods/${parsed.id}/thumb/thumb0-320x180.jpg`;
  }
}

export class VistaTwitchVideo extends VistaBox {
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
    image.src = this.origin?.image.src || getTwitchThumbnail(url);
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

      const parsed = parseTwitchUrl(url);
      if (parsed?.type === 'channel') {
        iframe.src = `https://player.twitch.tv/?channel=${parsed.id}&parent=${window.location.hostname}&autoplay=false`;
      } else if (parsed?.type === 'video') {
        iframe.src = `https://player.twitch.tv/?video=${parsed.id}&parent=${window.location.hostname}&autoplay=false`;
      }

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

export function twitchVideo(): VistaExtension {
  return {
    name: 'twitchVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const parsed = parseTwitchUrl(url);
      if (!parsed) return;

      return new VistaTwitchVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaTwitchVideo) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
