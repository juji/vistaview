---
title: Streamable Video Extension
description: Embed Streamable videos in the lightbox
---

The Streamable Video extension allows you to embed Streamable videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { streamableVideo } from 'vistaview/extensions/streamable-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery > a',
  extensions: [streamableVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/main/dist/extensions/streamable-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery > a',
    extensions: [VistaView.streamableVideo()],
  });
</script>
```

## Usage

Create links pointing to Streamable video URLs:

```html
<div id="gallery">
  <a href="https://streamable.com/abc123">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://streamable.com/e/abc123">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { streamableVideo } from 'vistaview/extensions/streamable-video';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery > a',
    extensions: [streamableVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses these Streamable URL formats:

- `https://streamable.com/VIDEO_ID`
- `https://streamable.com/e/VIDEO_ID`

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Streamable player controls available

## Video Size

The extension creates videos with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Bundle Size

- **ESM:** 2.69 KB (1.24 KB gzip)
- **UMD:** 13.73 KB (4.19 KB gzip)

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Streamable
- **Public videos only** - Extension works with publicly accessible videos

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Vimeo](/extensions/vimeo-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
