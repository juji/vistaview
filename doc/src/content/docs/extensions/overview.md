---
title: Extensions Overview
description: Extend VistaView with powerful extensions
---

VistaView provides optional extensions for additional functionality. Extensions are available in both ESM and UMD formats and can add UI controls, handle different content types, or modify behavior.

## Extension Types

### UI Extensions

Add interactive controls to the lightbox:

- **[Download](/extensions/download)** - Download button for saving high-resolution images
- **[Image Story](/extensions/image-story)** - Display rich HTML content alongside images

### Video Platform Extensions

Embed videos from popular platforms:

- **[YouTube](/extensions/youtube-video)** - Embed YouTube videos
- **[Vimeo](/extensions/vimeo-video)** - Embed Vimeo videos
- **[Dailymotion](/extensions/dailymotion-video)** - Embed Dailymotion videos
- **[Wistia](/extensions/wistia-video)** - Embed Wistia videos
- **[Vidyard](/extensions/vidyard-video)** - Embed Vidyard videos
- **[Streamable](/extensions/streamable-video)** - Embed Streamable videos

### Map Extensions

Embed interactive maps:

- **[Google Maps](/extensions/google-maps)** - Embed Google Maps (requires API key)
- **[Mapbox](/extensions/mapbox)** - Embed Mapbox GL JS maps (requires access token)
- **[OpenStreetMap](/extensions/openstreetmap)** - Embed OpenStreetMap with Leaflet.js (free)

### Development Extensions

- **[Logger](/extensions/logger)** - Debug extension that logs all lifecycle events

## Using Extensions

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';

vistaView({
  elements: '#gallery > a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download(), youtubeVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/extensions/download/dist/main.umd.cjs"></script>
<script src="https://unpkg.com/vistaview/extensions/youtube-video/dist/main.umd.cjs"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery > a',
    controls: {
      topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
    },
    extensions: [VistaView.download(), VistaView.youtubeVideo()],
  });
</script>
```

## Extension Sizes

All extensions are optimized for minimal bundle size:

| Extension         | ESM Size                 | UMD Size                |
| ----------------- | ------------------------ | ----------------------- |
| logger            | 0.60 KB (0.26 KB gzip)   | 0.72 KB (0.36 KB gzip)  |
| download          | 1.58 KB (0.78 KB gzip)   | 1.50 KB (0.81 KB gzip)  |
| streamable-video  | 2.53 KB (1.13 KB gzip)   | 2.22 KB (1.12 KB gzip)  |
| vimeo-video       | 2.44 KB (1.12 KB gzip)   | 2.18 KB (1.11 KB gzip)  |
| vidyard-video     | 2.53 KB (1.13 KB gzip)   | 2.24 KB (1.11 KB gzip)  |
| dailymotion-video | 2.63 KB (1.15 KB gzip)   | 2.30 KB (1.14 KB gzip)  |
| wistia-video      | 2.73 KB (1.24 KB gzip)   | 2.45 KB (1.24 KB gzip)  |
| youtube-video     | 2.89 KB (1.30 KB gzip)   | 2.56 KB (1.28 KB gzip)  |
| google-maps       | 3.53 KB (1.54 KB gzip)   | 3.07 KB (1.49 KB gzip)  |
| openstreetmap     | 4.75 KB (1.88 KB gzip)   | 4.10 KB (1.77 KB gzip)  |
| mapbox            | 4.91 KB (1.90 KB gzip)   | 4.32 KB (1.80 KB gzip)  |
| image-story       | 29.56 KB (10.06 KB gzip) | 23.36 KB (9.27 KB gzip) |

## Creating Custom Extensions

Want to create your own extension? Check out the [Extensions Authoring Guide](/extensions/authoring).

## Extension Capabilities

Extensions can:

- **Add UI controls** - Buttons, panels, overlays
- **Handle custom content** - Videos, maps, 3D models, etc.
- **Modify behavior** - Custom transitions, interactions
- **Track events** - Analytics, logging, debugging
- **Enhance functionality** - Download, share, annotations

## Next Steps

- Browse individual [extension documentation](/extensions/download)
- Learn to [create your own extensions](/extensions/authoring)
- See the [API Reference](/api-reference/main-function)
