---
title: OpenStreetMap Extension
description: Embed OpenStreetMap with Leaflet.js in the lightbox (Free)
---

The OpenStreetMap extension allows you to embed interactive OpenStreetMap maps using Leaflet.js in the VistaView lightbox. **No API key required** - completely free!

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { openstreetmap } from 'vistaview/extensions/openstreetmap';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery > a',
  extensions: [openstreetmap()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/main/dist/extensions/openstreetmap.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery > a',
    extensions: [VistaView.openstreetmap()],
  });
</script>
```

## Usage

Create links with OpenStreetMap-compatible coordinate URLs:

```html
<div id="gallery">
  <!-- Use osm:// protocol -->
  <a href="osm://40.7580,-73.9855,15">
    <img src="/thumbnails/map1.jpg" alt="Central Park, NYC" />
  </a>

  <a href="osm://34.0522,-118.2437,12">
    <img src="/thumbnails/map2.jpg" alt="Los Angeles" />
  </a>

  <a href="osm://51.5074,-0.1278,13">
    <img src="/thumbnails/map3.jpg" alt="London" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { openstreetmap } from 'vistaview/extensions/openstreetmap';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery > a',
    extensions: [openstreetmap()],
  });
</script>
```

## URL Format

Use this format in your `href` attribute:

```
osm://LATITUDE,LONGITUDE,ZOOM
```

Example:

```
osm://40.7580,-73.9855,15
```

Parameters:

- **LATITUDE**: Latitude coordinate (e.g., 40.7580)
- **LONGITUDE**: Longitude coordinate (e.g., -73.9855)
- **ZOOM**: Zoom level (1-19, where 1 is world view and 19 is street level)

## Features

- **100% Free** - No API keys, no billing, no usage limits
- **Interactive maps** - Full Leaflet.js functionality
- **Responsive sizing** - Maps adapt to lightbox size
- **Zoom controls** - Standard map controls
- **Attribution** - Properly credits OpenStreetMap contributors

## Map Size

The extension creates maps with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Mixing Images and Maps

You can mix images and OpenStreetMap maps in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- OpenStreetMap -->
  <a href="osm://40.7580,-73.9855,15">
    <img src="/thumbnails/map.jpg" alt="Central Park" />
  </a>

  <!-- Another Image -->
  <a href="/images/photo2.jpg">
    <img src="/thumbnails/photo2.jpg" alt="Photo 2" />
  </a>
</div>
```

## Bundle Size

- **ESM:** 4.79 KB (1.90 KB gzip)
- **UMD:** 15.43 KB (4.79 KB gzip)

Note: Leaflet.js library (~150KB) is loaded from CDN when a map is displayed.

## Why Choose OpenStreetMap?

### Advantages

- ✅ **Completely free** - No API keys or billing
- ✅ **No usage limits** - Unlimited map loads
- ✅ **Open source** - Community-driven project
- ✅ **Privacy-friendly** - No tracking by default
- ✅ **Lightweight** - Smaller than commercial alternatives

### Considerations

- Map styles are more basic than commercial providers
- Fewer built-in features compared to Google Maps/Mapbox
- Relies on community tile servers

## Tile Servers

By default, the extension uses OpenStreetMap's tile servers. Please be respectful:

- Don't make excessive requests
- Cache tiles when possible
- Consider using your own tile server for high-traffic sites

For production sites with high traffic, consider:

- [Mapbox](https://www.mapbox.com/) (has free tier)
- Self-hosted tile server
- Commercial OpenStreetMap providers

## Customization

The extension uses standard OpenStreetMap tiles. To use custom tile servers or styles, you'll need to create a custom version based on the extension source code.

## Attribution

The extension automatically includes proper attribution to OpenStreetMap contributors as required by the OpenStreetMap license.

## Limitations

- **Internet connection required** - Maps load from tile servers
- **Basic styling** - Standard OpenStreetMap appearance only
- **Tile server load** - Respect the free tile server's resources

## Example with Multiple Maps

```html
<div id="gallery">
  <a href="osm://48.8566,2.3522,13">
    <img src="/thumbnails/paris.jpg" alt="Paris, France" />
  </a>

  <a href="osm://35.6762,139.6503,12">
    <img src="/thumbnails/tokyo.jpg" alt="Tokyo, Japan" />
  </a>

  <a href="osm://-33.8688,151.2093,14">
    <img src="/thumbnails/sydney.jpg" alt="Sydney, Australia" />
  </a>
</div>
```

## Next Steps

- Try other map extensions: [Google Maps](/extensions/google-maps), [Mapbox](/extensions/mapbox)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
