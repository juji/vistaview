---
title: Extensions
description: Add extended functionality to VistaView
---

## extensions

Array of extension functions that add functionality to VistaView. Extensions can add UI controls, handle different content types (videos, maps), or modify lightbox behavior.

See the [Extensions Overview](/extensions/overview) for complete documentation on all available extensions and their usage.

**Type:** `VistaExtension[]`

**Default:** `[]` (no extensions)

```typescript
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';

vistaView({
  elements: '#gallery a',
  controls: {
    // Add 'download' to controls for download extension
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download(), youtubeVideo()],
});
```

**Note:** Some extensions like `download` require adding their control name to the `controls` configuration.

## Available Extensions

VistaView provides optional extensions for:

- **UI Controls** - Download buttons, image story overlays
- **Video Platforms** - YouTube, Vimeo, Dailymotion, Wistia, Vidyard, Streamable, Twitch
- **Maps** - Google Maps, Mapbox, OpenStreetMap
- **Development** - Logger for debugging

See the [Extensions Overview](/extensions/overview) for complete documentation on all available extensions and their usage.
