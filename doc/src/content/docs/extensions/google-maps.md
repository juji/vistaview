---
title: Google Maps Extension
description: Embed Google Maps in the lightbox
---

The Google Maps extension allows you to embed interactive Google Maps in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { googleMaps } from 'vistaview/extensions/google-maps';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [googleMaps({ apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' })],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/google-maps.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.googleMaps({ apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' })],
  });
</script>
```

## Requirements

You need a Google Maps API key to use this extension. Get one from the [Google Cloud Console](https://console.cloud.google.com/).

## Configuration

### apiKey (required)

Your Google Maps API key:

```javascript
googleMaps({
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
});
```

## Usage

Create links with Google Maps URLs:

```html
<div id="gallery">
  <!-- Coordinates -->
  <a href="https://www.google.com/maps/@40.7580,-73.9855,15z">
    <img src="/thumbnails/map1.jpg" alt="Central Park, NYC" />
  </a>

  <!-- Place search -->
  <a href="https://www.google.com/maps/place/Times+Square">
    <img src="/thumbnails/map2.jpg" alt="Times Square" />
  </a>

  <!-- Direct coordinates -->
  <a href="https://www.google.com/maps/@34.0522,-118.2437,12z">
    <img src="/thumbnails/map3.jpg" alt="Los Angeles" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { googleMaps } from 'vistaview/extensions/google-maps';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [googleMaps({ apiKey: 'YOUR_API_KEY' })],
  });
</script>
```

## Supported URL Formats

The extension parses various Google Maps URL formats:

- Coordinates: `https://www.google.com/maps/@LAT,LNG,ZOOM`
- Place: `https://www.google.com/maps/place/PLACE_NAME`
- Search: `https://www.google.com/maps/search/QUERY`

## Features

- **Interactive maps** - Full Google Maps functionality
- **Responsive sizing** - Maps adapt to lightbox size
- **All map types** - Satellite, terrain, street view support
- **Zoom controls** - Full map controls available

## Map Size

The extension creates maps with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Mixing Images and Maps

You can mix images and Google Maps in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- Google Map -->
  <a href="https://www.google.com/maps/@40.7580,-73.9855,15z">
    <img src="/thumbnails/map.jpg" alt="Central Park" />
  </a>
</div>
```

## Bundle Size

- **ESM:** 3.65 KB (1.60 KB gzip)
- **UMD:** 14.56 KB (4.56 KB gzip)

## API Usage and Billing

Google Maps API usage is subject to Google's pricing. Make sure to:

1. Set up billing in Google Cloud Console
2. Monitor your API usage
3. Set usage limits to avoid unexpected charges
4. Restrict your API key to your domains

## Limitations

- **Requires API key** - Must have valid Google Maps API key
- **Usage limits** - Subject to Google Maps API quotas and billing
- **Internet connection required** - Maps load from Google servers

## Security

**Important:** Restrict your API key to your domains to prevent unauthorized usage:

1. Go to Google Cloud Console
2. Select your API key
3. Add "HTTP referrers" restrictions
4. Add your domains (e.g., `yourdomain.com/*`)

## Next Steps

- Try other map extensions: [Mapbox](/extensions/mapbox), [OpenStreetMap](/extensions/openstreetmap)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
