import type { VistaData, VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';
import type { VistaView } from '../vista-view';

export interface MapboxConfig {
  accessToken: string;
  zoom?: number; // Default zoom level (0-22)
  width?: number; // Map width in pixels
  height?: number; // Map height in pixels
  style?: string; // Map style (e.g., 'streets-v12', 'satellite-v9', 'outdoors-v12')
  pitch?: number; // Camera pitch (0-60)
  bearing?: number; // Camera bearing (0-359)
}

export interface MapboxLocation {
  lng: number;
  lat: number;
  zoom?: number;
  bearing?: number;
  pitch?: number;
}

/**
 * Parse Mapbox URL and extract location data
 * Supports various Mapbox URL formats:
 * - https://api.mapbox.com/styles/v1/{username}/{style_id}/static/-74.0060,40.7128,15,0/800x600
 * - Custom format: mapbox://-74.0060,40.7128,15
 * @param url - Mapbox URL or coordinate string
 * @returns Location data or null if not found
 */
export function parseMapboxLocation(url: string): MapboxLocation | null {
  if (!url) return null;

  try {
    // Match pattern: lng,lat,zoom or lng,lat,zoom,bearing,pitch
    const coordMatch = url.match(
      /(-?\d+\.?\d*),\s*(-?\d+\.?\d*),?\s*(\d+\.?\d*)?,?\s*(\d+\.?\d*)?,?\s*(\d+\.?\d*)?/
    );
    if (coordMatch) {
      return {
        lng: parseFloat(coordMatch[1]),
        lat: parseFloat(coordMatch[2]),
        zoom: coordMatch[3] ? parseFloat(coordMatch[3]) : undefined,
        bearing: coordMatch[4] ? parseFloat(coordMatch[4]) : undefined,
        pitch: coordMatch[5] ? parseFloat(coordMatch[5]) : undefined,
      };
    }

    // Try URL parsing for mapbox.com links
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('mapbox.com')) {
      // Extract from pathname like /@lng,lat,zoom
      const atMatch = urlObj.pathname.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*),(\d+\.?\d*)?/);
      if (atMatch) {
        return {
          lng: parseFloat(atMatch[1]),
          lat: parseFloat(atMatch[2]),
          zoom: atMatch[3] ? parseFloat(atMatch[3]) : undefined,
        };
      }
    }
  } catch (error) {
    // Not a valid URL, might be coordinate string - already handled above
  }

  return null;
}

/**
 * Get Mapbox static image URL
 * @param location - Location data
 * @param config - Mapbox configuration
 * @returns Static map image URL
 */
export function getMapboxStaticImage(location: MapboxLocation, config: MapboxConfig): string {
  const zoom = location.zoom || config.zoom || 15;
  const width = config.width || 800;
  const height = config.height || 600;
  const style = config.style || 'streets-v12';
  const bearing = location.bearing || config.bearing || 0;
  const pitch = location.pitch || config.pitch || 0;

  // Add marker overlay
  const marker = `pin-s+ff0000(${location.lng},${location.lat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${marker}/${location.lng},${location.lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${config.accessToken}`;
}

export class VistaMapbox extends VistaBox {
  element: HTMLDivElement;
  private mapboxConfig: MapboxConfig;
  private location: MapboxLocation;
  private thumbnailImage: HTMLImageElement;

  constructor(par: VistaImageParams, config: MapboxConfig, location: MapboxLocation) {
    super(par);

    this.mapboxConfig = config;
    this.location = location;

    const div = document.createElement('div');
    div.style.position = 'relative';
    this.thumbnailImage = document.createElement('img');
    div.appendChild(this.thumbnailImage);
    this.thumbnailImage.src = this.origin?.image.src || getMapboxStaticImage(location, config);
    this.thumbnailImage.style.width = '100%';
    this.thumbnailImage.style.height = '100%';
    this.thumbnailImage.style.objectFit = 'cover';
    this.thumbnailImage.classList.add('vvw--pulsing');

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

    // Trigger setSizes to setup thumb and map initial style
    this.setSizes({ stableSize: false, initDimension: true });

    if (this.pos === 0) {
      // Load Mapbox GL JS dynamically if not already loaded
      this.loadMapboxGL().then(() => {
        this.initializeMap(div);
      });
    } else {
      this.isLoadedResolved!(true);
    }
  }

  private async loadMapboxGL(): Promise<void> {
    // Check if Mapbox GL is already loaded
    if ((window as any).mapboxgl) {
      return;
    }

    // Load CSS
    if (!document.querySelector('.vistaview-mapbox-gl-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.css';
      link.className = 'vistaview-mapbox-gl-css';
      document.head.appendChild(link);
    }

    // Load JS
    if (document.querySelector('.vistaview-mapbox-gl-js')) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://api.mapbox.com/mapbox-gl-js/v3.0.1/mapbox-gl.js';
      script.className = 'vistaview-mapbox-gl-js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Mapbox GL JS'));
      document.head.appendChild(script);
    });
  }

  private initializeMap(container: HTMLDivElement): void {
    const mapboxgl = (window as any).mapboxgl;
    if (!mapboxgl) {
      this.isLoadedRejected!(new Error('Mapbox GL JS not loaded'));
      return;
    }

    // Create map container div
    const mapDiv = document.createElement('div');
    mapDiv.style.position = 'absolute';
    mapDiv.style.top = '0';
    mapDiv.style.left = '0';
    mapDiv.style.width = '100%';
    mapDiv.style.height = '100%';
    mapDiv.style.opacity = '0';
    mapDiv.style.transition = 'opacity 1s ease';
    container.appendChild(mapDiv);

    // Stop pointer events from propagating to VistaView's drag handlers
    mapDiv.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });

    mapboxgl.accessToken = this.mapboxConfig.accessToken;

    const map = new mapboxgl.Map({
      container: mapDiv,
      style: `mapbox://styles/mapbox/${this.mapboxConfig.style || 'streets-v12'}`,
      center: [this.location.lng, this.location.lat],
      zoom: this.location.zoom || this.mapboxConfig.zoom || 15,
      bearing: this.location.bearing || this.mapboxConfig.bearing || 0,
      pitch: this.location.pitch || this.mapboxConfig.pitch || 0,
    });

    // Add marker
    new mapboxgl.Marker({ color: '#ff0000' })
      .setLngLat([this.location.lng, this.location.lat])
      .addTo(map);

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl());

    map.on('load', () => {
      this.onImageReady = () => {
        map.resize();
        mapDiv.style.opacity = '1';
        this.thumbnailImage.classList.remove('vvw--pulsing');
      };

      this.isLoadedResolved!(true);
    });

    map.on('error', (e: any) => {
      this.isLoadedRejected!(e);
    });
  }

  // Use 16:9 aspect ratio with max 800px width
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, this.mapboxConfig.width || 800);
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

export function mapbox(config: MapboxConfig): VistaExtension {
  if (!config.accessToken) {
    console.error('Mapbox access token is required');
  }

  return {
    name: 'mapbox',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const location = parseMapboxLocation(url);
      if (!location) return;

      return new VistaMapbox(params, config, location);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaMapbox) {
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
