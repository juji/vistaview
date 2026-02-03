---
title: Wistia Video Extension
description: Embed Wistia videos in the lightbox
---

The Wistia Video extension allows you to embed Wistia videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { wistiaVideo } from 'vistaview/extensions/wistia-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery > a',
  extensions: [wistiaVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/main/dist/extensions/wistia-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery > a',
    extensions: [VistaView.wistiaVideo()],
  });
</script>
```

## Usage

Create links pointing to Wistia video URLs:

```html
<div id="gallery">
  <a href="https://fast.wistia.net/embed/iframe/abc123def">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://username.wistia.com/medias/abc123def">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>
</div>
```

## Automatic Thumbnail Generation

The extension provides helper functions to work with Wistia video URLs:

```javascript
import { getWistiaThumbnail, parseWistiaVideoId } from 'vistaview/extensions/wistia-video';

// Extract video ID
const videoId = parseWistiaVideoId('https://fast.wistia.net/embed/iframe/abc123def');
// Returns: "abc123def"

// Get thumbnail URL (async - fetches from Wistia's oEmbed API)
const thumbnailUrl = await getWistiaThumbnail('https://fast.wistia.net/embed/iframe/abc123def');
// Returns: URL to the video thumbnail
```

:::tip[Wistia Thumbnail Note]
The `getWistiaThumbnail()` function is **async** because it fetches thumbnail information from Wistia's oEmbed API. Make sure to use `await` or handle the Promise appropriately.
:::

## Complete Example

```html
<div id="gallery"></div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { wistiaVideo, getWistiaThumbnail } from 'vistaview/extensions/wistia-video';
  import 'vistaview/style.css';

  // Array of Wistia video URLs
  const videos = [
    'https://fast.wistia.net/embed/iframe/abc123def',
    'https://myaccount.wistia.com/medias/xyz789ghi',
  ];

  // Generate gallery dynamically with thumbnails (async)
  const gallery = document.getElementById('gallery');

  (async () => {
    for (const videoUrl of videos) {
      const link = document.createElement('a');
      link.href = videoUrl;

      const img = document.createElement('img');
      // getWistiaThumbnail is async - fetches from Wistia's API
      img.src = await getWistiaThumbnail(videoUrl);
      img.alt = 'Video thumbnail';
      img.style.width = '200px';

      link.appendChild(img);
      gallery.appendChild(link);
    }

    vistaView({
      elements: '#gallery > a',
      extensions: [wistiaVideo()],
    });
  })();
</script>
```

## Supported URL Formats

The extension automatically detects and parses Wistia video URLs containing video IDs.

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Wistia player controls available
- **High quality** - Videos play at the best available quality

## Video Size

The extension creates videos with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Bundle Size

- **ESM:** 2.93 KB (1.35 KB gzip)
- **UMD:** 13.92 KB (4.28 KB gzip)

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Wistia
- **Wistia account required** - Videos must be hosted on Wistia

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Vimeo](/extensions/vimeo-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
