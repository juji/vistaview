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
<script src="https://unpkg.com/vistaview/main/dist/extensions/download.umd.js"></script>
<script src="https://unpkg.com/vistaview/main/dist/extensions/youtube-video.umd.js"></script>

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
| logger            | 0.61 KB (0.23 KB gzip)   | 0.76 KB (0.37 KB gzip)  |
| download          | 1.42 KB (0.70 KB gzip)   | 1.41 KB (0.79 KB gzip)  |
| streamable-video  | 2.69 KB (1.24 KB gzip)   | 13.73 KB (4.19 KB gzip) |
| vimeo-video       | 2.65 KB (1.24 KB gzip)   | 13.69 KB (4.19 KB gzip) |
| vidyard-video     | 2.73 KB (1.24 KB gzip)   | 13.75 KB (4.19 KB gzip) |
| dailymotion-video | 2.80 KB (1.26 KB gzip)   | 13.82 KB (4.21 KB gzip) |
| wistia-video      | 2.93 KB (1.35 KB gzip)   | 13.92 KB (4.28 KB gzip) |
| youtube-video     | 3.10 KB (1.42 KB gzip)   | 14.07 KB (4.36 KB gzip) |
| google-maps       | 3.65 KB (1.60 KB gzip)   | 14.56 KB (4.56 KB gzip) |
| openstreetmap     | 4.79 KB (1.90 KB gzip)   | 15.43 KB (4.79 KB gzip) |
| mapbox            | 4.99 KB (1.93 KB gzip)   | 15.63 KB (4.81 KB gzip) |
| image-story       | 33.60 KB (10.84 KB gzip) | 25.28 KB (9.81 KB gzip) |

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
