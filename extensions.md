# VistaView Extensions

VistaView provides optional extensions for additional functionality. Extensions are available in both ESM and UMD formats.

👉 **[Learn how to create your own extensions](./extensions-authoring.md)**

## Table of Contents

- [Download Extension](#download-extension)
- [Logger Extension](#logger-extension)
- [Image Story Extension](#image-story-extension)
- [Video Platform Extensions](#video-platform-extensions)
  - [YouTube](#youtube)
  - [Vimeo](#vimeo)
  - [Dailymotion](#dailymotion)
  - [Wistia](#wistia)
  - [Vidyard](#vidyard)
  - [Streamable](#streamable)
- [Map Extensions](#map-extensions)
  - [Google Maps](#google-maps)
  - [Mapbox](#mapbox)
  - [OpenStreetMap](#openstreetmap-free)

## Download Extension

Adds a download button to save the current high-resolution image.

**Bundle Size:** 1.42 KB ESM (0.70 KB gzip) | 1.41 KB UMD (0.79 KB gzip)

### ESM Usage

```js
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';

vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
```

### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/download.umd.js"></script>
<script>
  VistaView.vistaView({
    elements: '#gallery a',
    controls: {
      topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
    },
    extensions: [VistaView.download()],
  });
</script>
```

## Logger Extension

Debug extension that logs all lifecycle events to the console.

**Bundle Size:** 0.61 KB ESM (0.23 KB gzip) | 0.76 KB UMD (0.37 KB gzip)

### ESM Usage

```js
import { vistaView } from 'vistaview';
import { logger } from 'vistaview/extensions/logger';

vistaView({
  elements: '#gallery a',
  extensions: [logger()],
});
```

### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/logger.umd.js"></script>
<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.logger()],
  });
</script>
```

## Image Story Extension

Display rich HTML content alongside images with XSS protection via DOMPurify.

**Bundle Size:** 33.60 KB ESM (10.84 KB gzip) | 25.28 KB UMD (9.81 KB gzip)

### ESM Usage

```js
import { vistaView } from 'vistaview';
import { imageStory } from 'vistaview/extensions/image-story';
import 'vistaview/styles/extensions/image-story.css';

vistaView({
  elements: '#gallery a',
  controls: {
    bottomCenter: ['imageStory'],
  },
  extensions: [
    imageStory({
      getStory: async (index) => ({
        content: '<p>Story for image ' + index + '</p>',
        onLoad: () => console.log('Story loaded'),
        onUnload: () => console.log('Story unloaded'),
      }),
      maxStoryCache: 5, // Cache up to 5 stories
    }),
  ],
});
```

### UMD Usage

```html
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/styles/extensions/image-story.css" />
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/image-story.umd.js"></script>
<script>
  VistaView.vistaView({
    elements: '#gallery a',
    controls: {
      bottomCenter: ['imageStory'],
    },
    extensions: [
      VistaView.imageStory({
        getStory: async (index) => ({ content: '<p>Story ' + index + '</p>' }),
      }),
    ],
  });
</script>
```

## Video Platform Extensions

VistaView supports embedding videos from multiple platforms in the lightbox with automatic thumbnail detection and iframe playback.

### YouTube

Embed YouTube videos in the lightbox.

**Bundle Size:** 3.10 KB ESM (1.42 KB gzip) | 14.07 KB UMD (4.36 KB gzip)

**Supported URL formats:**

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`
- `https://www.youtube.com/shorts/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { youtubeVideo, getYouTubeThumbnail } from 'vistaview/extensions/youtube-video';

// Get thumbnail URL for a YouTube video
const thumbnailUrl = getYouTubeThumbnail('https://www.youtube.com/watch?v=VIDEO_ID', 'hq');

vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo()],
});
```

**Thumbnail quality options:** `'maxres'` | `'hq'` | `'mq'` | `'sd'` | `'default'` (default: `'hq'`)

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/youtube-video.umd.js"></script>
<script>
  // Get thumbnail URL
  const thumbnailUrl = VistaView.getYouTubeThumbnail(
    'https://www.youtube.com/watch?v=VIDEO_ID',
    'hq'
  );

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.youtubeVideo()],
  });
</script>
```

### Vimeo

Embed Vimeo videos in the lightbox.

**Bundle Size:** 2.65 KB ESM (1.24 KB gzip) | 13.69 KB UMD (4.19 KB gzip)

**Supported URL formats:**

- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`
- `https://vimeo.com/channels/CHANNEL/VIDEO_ID`
- `https://vimeo.com/groups/GROUP/videos/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { vimeoVideo, getVimeoThumbnail } from 'vistaview/extensions/vimeo-video';

// Get thumbnail URL
const thumbnailUrl = getVimeoThumbnail('https://vimeo.com/VIDEO_ID');

vistaView({
  elements: '#gallery a',
  extensions: [vimeoVideo()],
});
```

**Note:** Uses vumbnail.com for thumbnails. For production, consider using Vimeo's oEmbed API.

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vimeo-video.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getVimeoThumbnail('https://vimeo.com/VIDEO_ID');

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.vimeoVideo()],
  });
</script>
```

### Dailymotion

Embed Dailymotion videos in the lightbox.

**Bundle Size:** 2.80 KB ESM (1.26 KB gzip) | 13.82 KB UMD (4.21 KB gzip)

**Supported URL formats:**

- `https://www.dailymotion.com/video/VIDEO_ID`
- `https://dai.ly/VIDEO_ID`
- `https://www.dailymotion.com/embed/video/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { dailymotionVideo, getDailymotionThumbnail } from 'vistaview/extensions/dailymotion-video';

// Get thumbnail URL
const thumbnailUrl = getDailymotionThumbnail('https://www.dailymotion.com/video/VIDEO_ID');

vistaView({
  elements: '#gallery a',
  extensions: [dailymotionVideo()],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/dailymotion-video.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getDailymotionThumbnail(
    'https://www.dailymotion.com/video/VIDEO_ID'
  );

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.dailymotionVideo()],
  });
</script>
```

### Wistia

Embed Wistia videos in the lightbox.

**Bundle Size:** 2.93 KB ESM (1.35 KB gzip) | 13.92 KB UMD (4.28 KB gzip)

**Supported URL formats:**

- `https://home.wistia.com/medias/VIDEO_ID`
- `https://ACCOUNT.wistia.com/medias/VIDEO_ID`
- `https://fast.wistia.net/embed/iframe/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { wistiaVideo, getWistiaThumbnail } from 'vistaview/extensions/wistia-video';

// Get thumbnail URL (async function - uses Wistia's oEmbed API)
const thumbnailUrl = await getWistiaThumbnail('https://home.wistia.com/medias/VIDEO_ID');

vistaView({
  elements: '#gallery a',
  extensions: [wistiaVideo()],
});
```

**Note:** `getWistiaThumbnail()` returns a Promise as it fetches from Wistia's oEmbed API.

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/wistia-video.umd.js"></script>
<script>
  // Async function
  VistaView.getWistiaThumbnail('https://home.wistia.com/medias/VIDEO_ID').then((thumbnailUrl) => {
    console.log(thumbnailUrl);
  });

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.wistiaVideo()],
  });
</script>
```

### Vidyard

Embed Vidyard videos in the lightbox.

**Bundle Size:** 2.73 KB ESM (1.24 KB gzip) | 13.75 KB UMD (4.19 KB gzip)

**Supported URL formats:**

- `https://video.vidyard.com/watch/VIDEO_ID`
- `https://play.vidyard.com/VIDEO_ID`
- `https://share.vidyard.com/watch/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { vidyardVideo, getVidyardThumbnail } from 'vistaview/extensions/vidyard-video';

// Get thumbnail URL
const thumbnailUrl = getVidyardThumbnail('https://video.vidyard.com/watch/VIDEO_ID');

vistaView({
  elements: '#gallery a',
  extensions: [vidyardVideo()],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vidyard-video.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getVidyardThumbnail('https://video.vidyard.com/watch/VIDEO_ID');

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.vidyardVideo()],
  });
</script>
```

### Streamable

Embed Streamable videos in the lightbox.

**Bundle Size:** 2.69 KB ESM (1.24 KB gzip) | 13.73 KB UMD (4.19 KB gzip)

**Supported URL formats:**

- `https://streamable.com/VIDEO_ID`
- `https://streamable.com/e/VIDEO_ID`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { streamableVideo, getStreamableThumbnail } from 'vistaview/extensions/streamable-video';

// Get thumbnail URL
const thumbnailUrl = getStreamableThumbnail('https://streamable.com/VIDEO_ID');

vistaView({
  elements: '#gallery a',
  extensions: [streamableVideo()],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/streamable-video.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getStreamableThumbnail('https://streamable.com/VIDEO_ID');

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.streamableVideo()],
  });
</script>
```

### Using Multiple Video Extensions

#### ESM

```js
import { vistaView } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';
import { vimeoVideo } from 'vistaview/extensions/vimeo-video';
import { dailymotionVideo } from 'vistaview/extensions/dailymotion-video';
import { wistiaVideo } from 'vistaview/extensions/wistia-video';
import { vidyardVideo } from 'vistaview/extensions/vidyard-video';
import { streamableVideo } from 'vistaview/extensions/streamable-video';

vistaView({
  elements: '#gallery a',
  extensions: [
    youtubeVideo(),
    vimeoVideo(),
    dailymotionVideo(),
    wistiaVideo(),
    vidyardVideo(),
    streamableVideo(),
  ],
});
```

#### UMD

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/youtube-video.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vimeo-video.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/dailymotion-video.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/wistia-video.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vidyard-video.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/streamable-video.umd.js"></script>
<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.youtubeVideo(),
      VistaView.vimeoVideo(),
      VistaView.dailymotionVideo(),
      VistaView.wistiaVideo(),
      VistaView.vidyardVideo(),
      VistaView.streamableVideo(),
    ],
  });
</script>
```

## Map Extensions

VistaView supports embedding interactive maps from multiple providers in the lightbox.

### Google Maps

Embed Google Maps with iframe embedding.

**Bundle Size:** 3.65 KB ESM (1.60 KB gzip) | 14.56 KB UMD (4.56 KB gzip)

**Requirements:** Google Maps API key (get from [Google Cloud Console](https://console.cloud.google.com/))

**Supported URL formats:**

- `https://www.google.com/maps/@40.7128,-74.0060,15z`
- `https://www.google.com/maps?q=40.7128,-74.0060`
- `https://maps.google.com?q=40.7128,-74.0060`

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { googleMaps, getGoogleMapsStaticImage } from 'vistaview/extensions/google-maps';

// Get static map image URL for thumbnail
const thumbnailUrl = getGoogleMapsStaticImage(
  { lat: 40.7128, lng: -74.006, zoom: 15 },
  { apiKey: 'YOUR_API_KEY', zoom: 15 }
);

vistaView({
  elements: '#gallery a',
  extensions: [
    googleMaps({
      apiKey: 'YOUR_GOOGLE_MAPS_API_KEY', // Required
      zoom: 15, // Default zoom level
      width: 800, // Map width in pixels
      height: 600, // Map height in pixels
      mapType: 'roadmap', // 'roadmap' | 'satellite' | 'hybrid' | 'terrain'
    }),
  ],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/google-maps.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getGoogleMapsStaticImage(
    { lat: 40.7128, lng: -74.006, zoom: 15 },
    { apiKey: 'YOUR_API_KEY', zoom: 15 }
  );

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.googleMaps({
        apiKey: 'YOUR_GOOGLE_MAPS_API_KEY',
        zoom: 15,
        width: 800,
        height: 600,
        mapType: 'roadmap',
      }),
    ],
  });
</script>
```

### Mapbox

Embed Mapbox GL JS interactive maps with advanced features like 3D terrain and custom camera angles.

**Bundle Size:** 4.99 KB ESM (1.93 KB gzip) | 15.63 KB UMD (4.81 KB gzip)

**Requirements:** Mapbox access token (get from [Mapbox Account](https://account.mapbox.com/))

**Supported URL formats:**

- `https://api.mapbox.com/styles/v1/{username}/{style_id}/static/...`
- Custom format: `mapbox://-74.0060,40.7128,15` (lng,lat,zoom)

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { mapbox, getMapboxStaticImage } from 'vistaview/extensions/mapbox';

// Get static map image URL for thumbnail
const thumbnailUrl = getMapboxStaticImage(
  { lng: -74.006, lat: 40.7128, zoom: 15 },
  { accessToken: 'YOUR_ACCESS_TOKEN', zoom: 15 }
);

vistaView({
  elements: '#gallery a',
  extensions: [
    mapbox({
      accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN', // Required
      zoom: 15, // Default zoom level (0-22)
      width: 800, // Map width in pixels
      height: 600, // Map height in pixels
      style: 'streets-v12', // Map style (e.g., 'streets-v12', 'satellite-v9', 'outdoors-v12')
      pitch: 0, // Camera pitch (0-60)
      bearing: 0, // Camera bearing (0-359)
    }),
  ],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/mapbox.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getMapboxStaticImage(
    { lng: -74.006, lat: 40.7128, zoom: 15 },
    { accessToken: 'YOUR_ACCESS_TOKEN', zoom: 15 }
  );

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.mapbox({
        accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',
        zoom: 15,
        width: 800,
        height: 600,
        style: 'streets-v12',
        pitch: 0,
        bearing: 0,
      }),
    ],
  });
</script>
```

### OpenStreetMap (Free)

Embed OpenStreetMap with Leaflet.js. Completely free with no API key required!

**Bundle Size:** 4.79 KB ESM (1.90 KB gzip) | 15.43 KB UMD (4.79 KB gzip)

**Requirements:** None - completely free!

**Supported URL formats:**

- `https://www.openstreetmap.org/#map=15/40.7128/-74.0060`
- `https://www.openstreetmap.org/?mlat=40.7128&mlon=-74.0060`
- Custom format: `osm://40.7128,-74.0060,15` (lat,lng,zoom)

#### ESM Usage

```js
import { vistaView } from 'vistaview';
import { openStreetMap, getOpenStreetMapStaticImage } from 'vistaview/extensions/openstreetmap';

// Get static map tile URL for thumbnail
const thumbnailUrl = getOpenStreetMapStaticImage(
  { lat: 40.7128, lng: -74.006, zoom: 15 },
  { zoom: 15 }
);

vistaView({
  elements: '#gallery a',
  extensions: [
    openStreetMap({
      zoom: 15, // Default zoom level (0-19)
      width: 800, // Map width in pixels
      height: 600, // Map height in pixels
      tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', // Optional custom tile layer
      attribution: '© OpenStreetMap contributors', // Optional custom attribution
    }),
  ],
});
```

#### UMD Usage

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/openstreetmap.umd.js"></script>
<script>
  const thumbnailUrl = VistaView.getOpenStreetMapStaticImage(
    { lat: 40.7128, lng: -74.006, zoom: 15 },
    { zoom: 15 }
  );

  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.openStreetMap({
        zoom: 15,
        width: 800,
        height: 600,
        tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors',
      }),
    ],
  });
</script>
```

### Using Multiple Map Extensions

#### ESM

```js
import { vistaView } from 'vistaview';
import { googleMaps } from 'vistaview/extensions/google-maps';
import { mapbox } from 'vistaview/extensions/mapbox';
import { openStreetMap } from 'vistaview/extensions/openstreetmap';

vistaView({
  elements: '#gallery a',
  extensions: [
    googleMaps({ apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' }),
    mapbox({ accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN' }),
    openStreetMap(), // Free, no API key needed
  ],
});
```

#### UMD

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/google-maps.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/mapbox.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/openstreetmap.umd.js"></script>
<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.googleMaps({ apiKey: 'YOUR_GOOGLE_MAPS_API_KEY' }),
      VistaView.mapbox({ accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN' }),
      VistaView.openStreetMap(),
    ],
  });
</script>
```

## Extension Interface

Extensions implement the `VistaExtension` interface with optional lifecycle hooks:

- **`onInitializeImage`** — Called during element parsing; can return custom `VistaBox` implementation
- **`onOpen`** — Called when lightbox opens
- **`onImageView`** — Called when navigating between images
- **`onContentChange`** — Called when image content changes
- **`onClose`** — Called when lightbox closes
- **`control`** — Function that returns an HTMLElement or null to add UI controls (e.g., buttons)

See the [Extensions Authoring Guide](./extensions-authoring.md) for detailed documentation on creating custom extensions.
