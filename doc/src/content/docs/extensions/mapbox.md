---
title: Mapbox Extension
description: Embed Mapbox GL JS maps in the lightbox
---

The Mapbox extension allows you to embed interactive Mapbox GL JS maps in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { mapbox } from 'vistaview/extensions/mapbox';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [mapbox({ accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN' })],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/mapbox.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.mapbox({ accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN' })],
  });
</script>
```

## Requirements

You need a Mapbox access token to use this extension. Get one from [Mapbox](https://account.mapbox.com/).

## Configuration

### accessToken (required)

Your Mapbox access token:

```javascript
mapbox({
  accessToken: 'pk.your_mapbox_token_here',
});
```

## Usage

Create links with Mapbox-compatible coordinate URLs:

```html
<div id="gallery">
  <!-- Use mapbox:// protocol or coordinates in URL -->
  <a href="mapbox://40.7580,-73.9855,15">
    <img src="/thumbnails/map1.jpg" alt="Central Park, NYC" />
  </a>

  <a href="mapbox://34.0522,-118.2437,12">
    <img src="/thumbnails/map2.jpg" alt="Los Angeles" />
  </a>

  <!-- Or use standard coordinate format -->
  <a href="coords://51.5074,-0.1278,13">
    <img src="/thumbnails/map3.jpg" alt="London" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { mapbox } from 'vistaview/extensions/mapbox';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [mapbox({ accessToken: 'YOUR_TOKEN' })],
  });
</script>
```

## URL Format

Use this format in your `href` attribute:

```
mapbox://LATITUDE,LONGITUDE,ZOOM
```

Example:

```
mapbox://40.7580,-73.9855,15
```

Parameters:

- **LATITUDE**: Latitude coordinate (e.g., 40.7580)
- **LONGITUDE**: Longitude coordinate (e.g., -73.9855)
- **ZOOM**: Zoom level (1-22, where 1 is world view and 22 is street level)

## Features

- **Interactive maps** - Full Mapbox GL JS functionality
- **Responsive sizing** - Maps adapt to lightbox size
- **Multiple styles** - Streets, satellite, outdoors, etc.
- **Smooth animations** - Hardware-accelerated rendering
- **Vector tiles** - Sharp rendering at any zoom level

## Map Size

The extension creates maps with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Map Styles

By default, the extension uses Mapbox's standard style. You can customize this by modifying the extension code or creating a custom version.

## Mixing Images and Maps

You can mix images and Mapbox maps in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- Mapbox Map -->
  <a href="mapbox://40.7580,-73.9855,15">
    <img src="/thumbnails/map.jpg" alt="Central Park" />
  </a>
</div>
```

## Bundle Size

- **ESM:** 4.99 KB (1.93 KB gzip)
- **UMD:** 15.63 KB (4.81 KB gzip)

Note: Mapbox GL JS library (~500KB) is loaded from CDN when a map is displayed.

## Free Tier

Mapbox offers a generous free tier:

- 50,000 map loads per month
- No credit card required to start

Check [Mapbox pricing](https://www.mapbox.com/pricing) for current limits.

## Limitations

- **Requires access token** - Must have valid Mapbox token
- **Usage limits** - Subject to Mapbox API quotas
- **Internet connection required** - Maps load from Mapbox servers
- **Large library** - Mapbox GL JS is loaded from CDN (~500KB)

## TypeScript

Full TypeScript support:

```typescript
import type { VistaExtension } from 'vistaview';
import { mapbox } from 'vistaview/extensions/mapbox';

const extension: VistaExtension = mapbox({
  accessToken: 'YOUR_TOKEN',
});
```

## Troubleshooting

### Map not loading

1. Verify your access token is valid
2. Check browser console for errors
3. Ensure Mapbox GL JS loads successfully
4. Verify the URL format is correct

### Token errors

If you see "Unauthorized" errors:

1. Check if your token is active in Mapbox account
2. Verify the token has the correct scopes
3. Check if your domain is allowed (if URL restrictions are set)

## Security

**Best practices:**

1. Use public tokens (start with `pk.`) for client-side use
2. Restrict tokens to specific URLs in production
3. Monitor usage in Mapbox dashboard
4. Rotate tokens periodically

## Next Steps

- Try other map extensions: [Google Maps](/extensions/google-maps), [OpenStreetMap](/extensions/openstreetmap)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
