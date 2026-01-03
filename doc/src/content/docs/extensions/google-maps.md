---
title: Google Maps Extension
description: Embed interactive Google Maps in the lightbox
---

The Google Maps extension allows you to embed interactive Google Maps in the VistaView lightbox. It displays a static image initially, then loads an interactive iframe embed when opened.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { googleMaps } from 'vistaview/extensions/google-maps';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [googleMaps()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/google-maps.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.googleMaps()],
  });
</script>
```

## Requirements

**No API key required** for basic functionality. The extension uses Google Maps' free iframe embed for the interactive map.

An API key is **only needed** if you want to auto-generate static map thumbnails when no `<img>` tag is provided (using Google Maps Static API).

## Configuration

All configuration options are optional:

### apiKey

Your Google Maps API key. **Required to use the Google Maps Static API for generating static map images.** The `getGoogleMapsStaticImage` function uses this to create Static API URLs. The extension will also use this to generate an image if the origin thumbnail image is not available.

```javascript
googleMaps({
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
});
```

### zoom

Default zoom level for auto-generated thumbnails (1-20). Default: `15`.

### width

Width for auto-generated thumbnails in pixels. Default: `800`.

### height

Height for auto-generated thumbnails in pixels. Default: `600`.

### mapType

Map type for auto-generated thumbnails: `'roadmap'`, `'satellite'`, `'hybrid'`, or `'terrain'`. Default: `'roadmap'`.

## Usage

### Basic Usage (Recommended)

Provide your own thumbnail images - no API key needed:

```html
<div id="gallery">
  <a href="https://www.google.com/maps/@40.7580,-73.9855,15z">
    <img src="/thumbnails/central-park.jpg" alt="Central Park, NYC" />
  </a>

  <a href="https://www.google.com/maps?q=Empire+State+Building">
    <img src="/thumbnails/empire-state.jpg" alt="Empire State Building" />
  </a>

  <a href="https://www.google.com/maps/@34.0522,-118.2437,12z">
    <img src="/thumbnails/los-angeles.jpg" alt="Los Angeles" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { googleMaps } from 'vistaview/extensions/google-maps';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [googleMaps()], // No configuration needed
  });
</script>
```

### Generate Static Map Thumbnails

Use `getGoogleMapsStaticImage` to create Google Maps Static API thumbnail URLs:

```javascript
import {
  getGoogleMapsStaticImage,
  parseGoogleMapsLocation,
} from 'vistaview/extensions/google-maps';

// Parse the Google Maps URL
const url = 'https://www.google.com/maps/@40.7580,-73.9855,15z';
const location = parseGoogleMapsLocation(url);

// Generate static map image URL
const staticImageUrl = getGoogleMapsStaticImage(location, {
  apiKey: 'YOUR_API_KEY',
  zoom: 15,
  width: 800,
  height: 600,
  mapType: 'roadmap',
});

console.log(staticImageUrl);
// https://maps.googleapis.com/maps/api/staticmap?center=40.7580,-73.9855&zoom=15&size=800x600&maptype=roadmap&markers=color:red|40.7580,-73.9855&key=YOUR_API_KEY
```

Then use the generated URL in your HTML:

```html
<div id="gallery">
  <a href="https://www.google.com/maps/@40.7580,-73.9855,15z">
    <img
      src="https://maps.googleapis.com/maps/api/staticmap?center=40.7580,-73.9855&zoom=15&size=800x600&maptype=roadmap&markers=color:red|40.7580,-73.9855&key=YOUR_API_KEY"
      alt="Central Park, NYC"
    />
  </a>
  <a href="https://www.google.com/maps?q=Times+Square">
    <img
      src="https://maps.googleapis.com/maps/api/staticmap?center=Times+Square&zoom=15&size=800x600&maptype=roadmap&key=YOUR_API_KEY"
      alt="Times Square"
    />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { googleMaps } from 'vistaview/extensions/google-maps';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [googleMaps()],
  });
</script>
```

## Supported URL Formats

The extension automatically parses various Google Maps URL formats:

### Coordinate Format (@lat,lng,zoom)

```
https://www.google.com/maps/@40.7580,-73.9855,15z
```

### Query Parameter (q=lat,lng or q=place)

```
https://www.google.com/maps?q=40.7580,-73.9855
https://www.google.com/maps?q=Empire+State+Building
```

### LL Parameter (ll=lat,lng)

```
https://maps.google.com?ll=40.7580,-73.9855
```

### Short URLs

```
https://goo.gl/maps/example
```

## Features

- **Free interactive maps** - Uses Google Maps iframe embed (no API key needed)
- **Static previews** - Shows thumbnail image before loading interactive map
- **Smooth transitions** - Fades from static to interactive (1s ease)
- **Pulsing animation** - Loading indicator while iframe loads
- **Responsive sizing** - Maps adapt to lightbox size (16:9 aspect ratio, max 800px width)
- **Full map features** - All Google Maps functionality (zoom, pan, street view, etc.)
- **UI integration** - Automatically disables download and zoom buttons

## How It Works

1. **Initial display**: Shows thumbnail image (from `<img>` tag or auto-generated with API key)
2. **On open**: Loads Google Maps iframe embed in background
3. **Transition**: Fades from static image to interactive map when loaded
4. **Interaction**: Full Google Maps functionality available

## Mixing Content Types

You can mix images and Google Maps in the same gallery:

```html
<div id="gallery">
  <!-- Regular image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Beach Photo" />
  </a>

  <!-- Google Map -->
  <a href="https://www.google.com/maps/@40.7580,-73.9855,15z">
    <img src="/thumbnails/map.jpg" alt="Central Park" />
  </a>

  <!-- Another image -->
  <a href="/images/photo2.jpg">
    <img src="/thumbnails/photo2.jpg" alt="Mountain Photo" />
  </a>
</div>
```

## Bundle Size

- **ESM:** ~3.5 KB (minified)
- **UMD:** ~12 KB (minified)

No external dependencies - the extension uses native iframe embeds.

## API Key Setup (Optional)

**Only needed if you want auto-generated thumbnails.**

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable **Maps Static API**
4. Create an API key
5. Restrict the key:
   - **Application restrictions**: HTTP referrers (your domain)
   - **API restrictions**: Maps Static API only

## Pricing

- **Interactive maps (iframe)**: **FREE** - unlimited usage
- **Static thumbnails (when auto-generated)**: Subject to [Google Maps Static API pricing](https://mapsplatform.google.com/pricing/)
  - Free tier: 28,000 static map loads/month
  - After free tier: $2.00 per 1,000 loads

💡 **Tip**: Use your own thumbnail images to avoid Static API costs entirely.

## Example: Travel Photo Gallery

```html
<div id="travel-gallery">
  <a href="/images/eiffel-tower.jpg">
    <img src="/thumbnails/eiffel-tower.jpg" alt="Eiffel Tower" />
  </a>

  <a href="https://www.google.com/maps/@48.8584,2.2945,15z">
    <img src="/thumbnails/paris-map.jpg" alt="Paris Map" />
  </a>

  <a href="/images/notre-dame.jpg">
    <img src="/thumbnails/notre-dame.jpg" alt="Notre Dame" />
  </a>

  <a href="https://www.google.com/maps?q=Louvre+Museum">
    <img src="/thumbnails/louvre-map.jpg" alt="Louvre Location" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { googleMaps } from 'vistaview/extensions/google-maps';

  vistaView({
    elements: '#travel-gallery a',
    extensions: [googleMaps()],
  });
</script>
```

## Troubleshooting

### Map not opening

- Verify the URL is a valid Google Maps URL
- Check browser console for errors

### Static thumbnail not showing (with API key)

- Ensure Maps Static API is enabled in Google Cloud Console
- Verify API key is correct
- Check API key restrictions aren't blocking requests
- Check browser console for error messages

### No thumbnail showing (without API key, without `<img>`)

This is expected behavior. Either:

- Add `<img>` tags with your own thumbnails (recommended)
- Provide an API key to auto-generate thumbnails

## Related Extensions

- [Mapbox](/extensions/mapbox) - Mapbox GL JS maps
- [OpenStreetMap](/extensions/openstreetmap) - OpenStreetMap embeds
- [YouTube Video](/extensions/youtube-video) - Embed YouTube videos
