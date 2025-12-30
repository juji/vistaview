import type { VistaExtension, VistaImageParams } from '../types';
import { VistaBox } from '../vista-box';

export interface OpenStreetMapConfig {
  zoom?: number; // Default zoom level (0-19)
  width?: number; // Map width in pixels
  height?: number; // Map height in pixels
  tileLayer?: string; // Tile layer URL (default: OpenStreetMap)
  attribution?: string; // Custom attribution
}

export interface OpenStreetMapLocation {
  lat: number;
  lng: number;
  zoom?: number;
}

/**
 * Parse OpenStreetMap URL and extract location data
 * Supports various OpenStreetMap URL formats:
 * - https://www.openstreetmap.org/#map=15/40.7128/-74.0060
 * - https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.0060#map=15/40.7128/-74.0060
 * - Custom format: osm://40.7128,-74.0060,15
 * @param url - OpenStreetMap URL or coordinate string
 * @returns Location data or null if not found
 */
export function parseOpenStreetMapLocation(url: string): OpenStreetMapLocation | null {
  if (!url) return null;

  try {
    // Match custom format: osm://lat,lng,zoom or just lat,lng,zoom
    const coordMatch = url.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*),?\s*(\d+\.?\d*)?/);
    if (coordMatch) {
      return {
        lat: parseFloat(coordMatch[1]),
        lng: parseFloat(coordMatch[2]),
        zoom: coordMatch[3] ? parseFloat(coordMatch[3]) : undefined,
      };
    }

    // Try URL parsing for openstreetmap.org links
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('openstreetmap.org')) {
      // Extract from hash like #map=15/40.7128/-74.0060
      const hashMatch = urlObj.hash.match(/#map=(\d+\.?\d*)\/(-?\d+\.?\d*)\/(-?\d+\.?\d*)/);
      if (hashMatch) {
        return {
          zoom: parseFloat(hashMatch[1]),
          lat: parseFloat(hashMatch[2]),
          lng: parseFloat(hashMatch[3]),
        };
      }

      // Extract from query params
      const mlat = urlObj.searchParams.get('mlat');
      const mlon = urlObj.searchParams.get('mlon');
      if (mlat && mlon) {
        return {
          lat: parseFloat(mlat),
          lng: parseFloat(mlon),
        };
      }
    }
  } catch (error) {
    // Not a valid URL, might be coordinate string - already handled above
  }

  return null;
}

/**
 * Get OpenStreetMap static image URL
 * Uses a direct tile approach for static map preview
 * @param location - Location data
 * @param config - OpenStreetMap configuration
 * @returns Static map image URL
 */
export function getOpenStreetMapStaticImage(
  location: OpenStreetMapLocation,
  config: OpenStreetMapConfig
): string {
  const zoom = location.zoom || config.zoom || 15;

  // Calculate tile coordinates for the given lat/lng/zoom
  const lat = location.lat;
  const lng = location.lng;
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const y = Math.floor(
    ((1 -
      Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) /
      2) *
      n
  );

  // Return a single tile centered on the location
  return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
}

export class VistaOpenStreetMap extends VistaBox {
  element: HTMLDivElement | HTMLImageElement;
  private osmConfig: OpenStreetMapConfig;
  private location: OpenStreetMapLocation;
  private thumbnailImage: HTMLImageElement;

  constructor(par: VistaImageParams, config: OpenStreetMapConfig, location: OpenStreetMapLocation) {
    super(par);

    this.osmConfig = config;
    this.location = location;

    const div = document.createElement('div');
    div.style.position = 'relative';
    this.thumbnailImage = document.createElement('img');
    div.appendChild(this.thumbnailImage);
    this.thumbnailImage.src =
      this.origin?.image.src || getOpenStreetMapStaticImage(location, config);
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
      // Load Leaflet dynamically if not already loaded
      this.loadLeaflet().then(() => {
        this.initializeMap(div);
      });
    } else {
      this.isLoadedResolved!(true);
    }
  }

  private async loadLeaflet(): Promise<void> {
    // Check if Leaflet is already loaded
    if ((window as any).L) {
      return;
    }

    // Load CSS
    if (!document.querySelector('.vistaview-leaflet-css')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      link.className = 'vistaview-leaflet-css';
      document.head.appendChild(link);
    }

    // Load JS
    if (document.querySelector('.vistaview-leaflet-js')) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.className = 'vistaview-leaflet-js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Leaflet'));
      document.head.appendChild(script);
    });
  }

  private initializeMap(container: HTMLDivElement): void {
    const L = (window as any).L;
    if (!L) {
      this.isLoadedRejected!(new Error('Leaflet not loaded'));
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

    // Initialize Leaflet map
    const map = L.map(mapDiv, {
      center: [this.location.lat, this.location.lng],
      zoom: this.location.zoom || this.osmConfig.zoom || 15,
    });

    // Add tile layer
    const tileLayer =
      this.osmConfig.tileLayer || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const attribution =
      this.osmConfig.attribution ||
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

    L.tileLayer(tileLayer, {
      attribution: attribution,
      maxZoom: 19,
    }).addTo(map);

    // Add marker
    L.marker([this.location.lat, this.location.lng])
      .addTo(map)
      .bindPopup(`${this.location.lat}, ${this.location.lng}`);

    // Wait for tiles to load
    map.whenReady(() => {
      this.onImageReady = () => {
        map.invalidateSize();
        mapDiv.style.opacity = '1';
        this.thumbnailImage.classList.remove('vvw--pulsing');
      };

      this.isLoadedResolved!(true);
    });
  }

  // Use 16:9 aspect ratio with max 800px width
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, this.osmConfig.width || 800);
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

export function openStreetMap(config: OpenStreetMapConfig = {}): VistaExtension {
  return {
    name: 'openStreetMap',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const location = parseOpenStreetMapLocation(url);
      if (!location) return;

      return new VistaOpenStreetMap(params, config, location);
    },
  };
}
