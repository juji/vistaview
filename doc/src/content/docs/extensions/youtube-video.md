---
title: YouTube Video Extension
description: Embed YouTube videos in the lightbox
---

The YouTube Video extension allows you to embed YouTube videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/youtube-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.youtubeVideo()],
  });
</script>
```

## Usage

Create links pointing to YouTube video URLs:

```html
<div id="gallery">
  <!-- Various YouTube URL formats supported -->
  <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://youtu.be/dQw4w9WgXcQ">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>

  <a href="https://www.youtube.com/embed/dQw4w9WgXcQ">
    <img src="/thumbnails/video3.jpg" alt="Video 3" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { youtubeVideo } from 'vistaview/extensions/youtube-video';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [youtubeVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses these YouTube URL formats:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`
- `https://m.youtube.com/watch?v=VIDEO_ID`

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All YouTube player controls available
- **No related videos from other channels** - `rel=0` parameter set by default

## Mixing Images and Videos

You can mix images and YouTube videos in the same gallery:

```html
<div id="gallery">
  <!-- Image -->
  <a href="/images/photo1.jpg">
    <img src="/thumbnails/photo1.jpg" alt="Photo 1" />
  </a>

  <!-- YouTube Video -->
  <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
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

## Customization

### Custom Video Size

Extend the extension to customize video dimensions:

```javascript
import { youtubeVideo } from 'vistaview/extensions/youtube-video';

// The extension uses fixed sizing, but you can create a custom version
// See the Extensions Authoring Guide for details
```

### Styling

The video iframe uses the class `vvw-img-hi` and can be styled:

```css
.vvw-img-hi {
  border-radius: 8px;
  box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}
```

## Bundle Size

- **ESM:** 3.10 KB (1.42 KB gzip)
- **UMD:** 14.07 KB (4.36 KB gzip)

## Privacy Considerations

This extension embeds YouTube videos using the standard `youtube.com` domain. For enhanced privacy, you may want to create a custom extension using `youtube-nocookie.com` domain.

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from YouTube
- **YouTube Terms of Service** - Ensure compliance with YouTube's ToS

## Example with Multiple Extensions

```javascript
import { vistaView } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';
import { vimeoVideo } from 'vistaview/extensions/vimeo-video';
import { download } from 'vistaview/extensions/download';

vistaView({
  elements: '#gallery a',
  extensions: [
    youtubeVideo(),
    vimeoVideo(),
    download(), // Works for images, not videos
  ],
});
```

## TypeScript

Full TypeScript support:

```typescript
import type { VistaExtension } from 'vistaview';
import { youtubeVideo } from 'vistaview/extensions/youtube-video';

const extension: VistaExtension = youtubeVideo();
```

## Troubleshooting

### Video not loading

1. Check the video URL is valid and public
2. Verify the video ID is correct
3. Check browser console for errors
4. Ensure the video is not region-restricted

### Video not autoplaying

Some browsers block autoplay with sound. This is expected behavior due to browser policies.

## Next Steps

- Try other video extensions: [Vimeo](/extensions/vimeo-video), [Dailymotion](/extensions/dailymotion-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
