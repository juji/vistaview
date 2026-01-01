import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

export interface GoogleMapsConfig {
  apiKey: string;
  zoom?: number; // Default zoom level (1-20)
  width?: number; // Map width in pixels
  height?: number; // Map height in pixels
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
}

export interface GoogleMapsLocation {
  lat: number;
  lng: number;
  zoom?: number;
  query?: string;
}

/**
 * Parse Google Maps URL and extract location data
 * Supports various Google Maps URL formats:
 * - https://www.google.com/maps?q=40.7128,-74.0060
 * - https://www.google.com/maps/@40.7128,-74.0060,15z
 * - https://maps.google.com?q=40.7128,-74.0060
 * - https://goo.gl/maps/...
 * @param url - Google Maps URL
 * @returns Location data or null if not found
 */
export function parseGoogleMapsLocation(url: string): GoogleMapsLocation | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);

    // Check for @lat,lng,zoom format
    const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),?(\d+\.?\d*)?z?/);
    if (atMatch) {
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2]),
        zoom: atMatch[3] ? parseFloat(atMatch[3]) : undefined,
      };
    }

    // Check for q=lat,lng format
    const qParam = urlObj.searchParams.get('q');
    if (qParam) {
      const coordMatch = qParam.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/);
      if (coordMatch) {
        return {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2]),
          query: qParam,
        };
      }
      // If q param doesn't contain coordinates, store it as a query
      return { lat: 0, lng: 0, query: qParam };
    }

    // Check for ll= parameter (lat,lng)
    const llParam = urlObj.searchParams.get('ll');
    if (llParam) {
      const [lat, lng] = llParam.split(',').map(parseFloat);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (error) {
    console.error('Failed to parse Google Maps URL:', error);
  }

  return null;
}

/**
 * Get Google Maps static image URL
 * @param location - Location data
 * @param config - Google Maps configuration
 * @returns Static map image URL
 */
export function getGoogleMapsStaticImage(
  location: GoogleMapsLocation,
  config: GoogleMapsConfig
): string {
  const zoom = location.zoom || config.zoom || 15;
  const width = config.width || 800;
  const height = config.height || 600;
  const mapType = config.mapType || 'roadmap';

  const center = location.query || `${location.lat},${location.lng}`;
  const marker = location.query ? '' : `&markers=color:red|${location.lat},${location.lng}`;

  return `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(center)}&zoom=${zoom}&size=${width}x${height}&maptype=${mapType}${marker}&key=${config.apiKey}`;
}

export class VistaGoogleMaps extends VistaBox {
  element: HTMLDivElement;
  private mapsConfig: GoogleMapsConfig;
  private location: GoogleMapsLocation;

  constructor(par: VistaImageParams, config: GoogleMapsConfig, location: GoogleMapsLocation) {
    super(par);

    this.mapsConfig = config;
    this.location = location;

    const div = document.createElement('div');
    div.style.position = 'relative';
    const image = document.createElement('img');
    div.appendChild(image);
    image.src = this.origin?.image.src || getGoogleMapsStaticImage(location, config);
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.classList.add('vvw--pulsing');

    this.element = div;

    this.element.classList.add('vvw-img-hi');

    // Set sizes
    const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5;
    this.maxW = this.fullW; // no scaling
    this.element.style.width = `${fullWidth}px`;
    this.element.style.height = `${fullHeight}px`;

    // Trigger setSizes to setup thumb and iframe initial style
    this.setSizes({ stableSize: false, initDimension: true });

    if (this.pos === 0) {
      const iframe = document.createElement('iframe');
      iframe.frameBorder = '0';
      iframe.allow = 'geolocation';
      iframe.allowFullscreen = true;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.backgroundColor = 'transparent';
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';

      // Use standard Google Maps iframe embed
      let embedUrl: string;
      if (this.location.query) {
        embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(this.location.query)}&output=embed`;
      } else {
        embedUrl = `https://www.google.com/maps?q=${this.location.lat},${this.location.lng}&output=embed`;
      }
      iframe.src = embedUrl;
      div.appendChild(iframe);

      iframe.onload = () => {
        iframe.style.opacity = '1';
        image.classList.remove('vvw--pulsing');
      };
    }

    this.isLoadedResolved!(true);
  }

  // Use 16:9 aspect ratio with max 800px width
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, this.mapsConfig.width || 800);
    return {
      width: maxWidth,
      height: (maxWidth * 9) / 16,
    };
  }

  // Override to avoid propagating content change event
  setFinalTransform() {
    return super.setFinalTransform({ propagateEvent: false });
  }
}

export function googleMaps(config: GoogleMapsConfig): VistaExtension {
  if (!config.apiKey) {
    console.error('Google Maps API key is required');
  }

  return {
    name: 'googleMaps',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const location = parseGoogleMapsLocation(url);
      if (!location) return;

      return new VistaGoogleMaps(params, config, location);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaGoogleMaps) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
