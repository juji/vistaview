---
title: Vimeo Video Extension
description: Embed Vimeo videos in the lightbox
---

The Vimeo Video extension allows you to embed Vimeo videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { vimeoVideo } from 'vistaview/extensions/vimeo-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [vimeoVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vimeo-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.vimeoVideo()],
  });
</script>
```

## Usage

Create links pointing to Vimeo video URLs:

```html
<div id="gallery">
  <!-- Various Vimeo URL formats supported -->
  <a href="https://vimeo.com/123456789">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://player.vimeo.com/video/123456789">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>
</div>
```

## Automatic Thumbnail Generation

The extension provides helper functions to generate Vimeo thumbnail URLs from video URLs:

```javascript
import { getVimeoThumbnail, parseVimeoVideoId } from 'vistaview/extensions/vimeo-video';

// Generate thumbnail URL from video URL
const thumbnailUrl = getVimeoThumbnail('https://vimeo.com/123456789');
// Returns: "https://vumbnail.com/123456789.jpg"

// Or extract just the video ID
const videoId = parseVimeoVideoId('https://vimeo.com/123456789');
// Returns: "123456789"
```

:::tip[Vimeo Thumbnail Note]
Vimeo doesn't provide direct thumbnail URLs without API authentication. The `getVimeoThumbnail()` function uses vumbnail.com as a workaround. For production use, consider using [Vimeo's oEmbed API](https://developer.vimeo.com/api/oembed) for more reliable thumbnails.
:::

## Complete Example

```html
<div id="gallery"></div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { vimeoVideo, getVimeoThumbnail } from 'vistaview/extensions/vimeo-video';
  import 'vistaview/style.css';

  // Array of Vimeo video URLs
  const videos = [
    'https://vimeo.com/123456789',
    'https://player.vimeo.com/video/987654321',
    'https://vimeo.com/555666777',
  ];

  // Generate gallery dynamically with thumbnails
  const gallery = document.getElementById('gallery');
  videos.forEach((videoUrl) => {
    const link = document.createElement('a');
    link.href = videoUrl;

    const img = document.createElement('img');
    img.src = getVimeoThumbnail(videoUrl);
    img.alt = 'Video thumbnail';
    img.style.width = '200px';

    link.appendChild(img);
    gallery.appendChild(link);
  });

  vistaView({
    elements: '#gallery a',
    extensions: [vimeoVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses these Vimeo URL formats:

- `https://vimeo.com/VIDEO_ID`
- `https://player.vimeo.com/video/VIDEO_ID`
- `https://www.vimeo.com/VIDEO_ID`

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Vimeo player controls available
- **High quality** - Videos play at the best available quality

## Mixing Images and Videos

You can mix images and Vimeo videos in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- Vimeo Video -->
  <a href="https://vimeo.com/123456789">
    <img src="/thumbnails/video.jpg" alt="Video" />
  </a>

  <!-- Another Image -->
  <a href="/images/photo2.jpg">
    <img src="/thumbnails/photo2.jpg" alt="Photo 2" />
  </a>
</div>
```

## Video Size

The extension creates videos with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Bundle Size

- **ESM:** 2.65 KB (1.24 KB gzip)
- **UMD:** 13.69 KB (4.19 KB gzip)

## Privacy Considerations

This extension embeds Vimeo videos using the standard Vimeo player. The player may use cookies and track user interactions according to Vimeo's privacy policy.

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Vimeo
- **Vimeo Terms of Service** - Ensure compliance with Vimeo's ToS
- **Private videos** - Requires proper authentication/permissions

## Example with Multiple Extensions

```javascript
import { vistaView } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';
import { vimeoVideo } from 'vistaview/extensions/vimeo-video';

vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo(), vimeoVideo()],
});
```

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Dailymotion](/extensions/dailymotion-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
