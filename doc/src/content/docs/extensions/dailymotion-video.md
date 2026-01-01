---
title: Dailymotion Video Extension
description: Embed Dailymotion videos in the lightbox
---

The Dailymotion Video extension allows you to embed Dailymotion videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { dailymotionVideo } from 'vistaview/extensions/dailymotion-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [dailymotionVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/dailymotion-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.dailymotionVideo()],
  });
</script>
```

## Usage

Create links pointing to Dailymotion video URLs:

```html
<div id="gallery">
  <!-- Dailymotion URL formats -->
  <a href="https://www.dailymotion.com/video/x8abcde">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://dai.ly/x8abcde">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { dailymotionVideo } from 'vistaview/extensions/dailymotion-video';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [dailymotionVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses these Dailymotion URL formats:

- `https://www.dailymotion.com/video/VIDEO_ID`
- `https://dailymotion.com/video/VIDEO_ID`
- `https://dai.ly/VIDEO_ID`

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Dailymotion player controls available
- **High quality** - Videos play at the best available quality

## Mixing Images and Videos

You can mix images and Dailymotion videos in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- Dailymotion Video -->
  <a href="https://www.dailymotion.com/video/x8abcde">
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

- **ESM:** 2.80 KB (1.26 KB gzip)
- **UMD:** 13.82 KB (4.21 KB gzip)

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Dailymotion
- **Dailymotion Terms of Service** - Ensure compliance with Dailymotion's ToS
- **Regional restrictions** - Some videos may be region-restricted

## Example with Multiple Video Platforms

```javascript
import { vistaView } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';
import { vimeoVideo } from 'vistaview/extensions/vimeo-video';
import { dailymotionVideo } from 'vistaview/extensions/dailymotion-video';

vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo(), vimeoVideo(), dailymotionVideo()],
});
```

## TypeScript

Full TypeScript support:

```typescript
import type { VistaExtension } from 'vistaview';
import { dailymotionVideo } from 'vistaview/extensions/dailymotion-video';

const extension: VistaExtension = dailymotionVideo();
```

## Troubleshooting

### Video not loading

1. Check the video URL is valid and public
2. Verify the video ID is correct
3. Check browser console for errors
4. Ensure the video allows embedding
5. Check if the video is region-restricted

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Vimeo](/extensions/vimeo-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
