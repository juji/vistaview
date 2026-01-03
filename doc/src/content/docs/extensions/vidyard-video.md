---
title: Vidyard Video Extension
description: Embed Vidyard videos in the lightbox
---

The Vidyard Video extension allows you to embed Vidyard videos in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { vidyardVideo } from 'vistaview/extensions/vidyard-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [vidyardVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/vidyard-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.vidyardVideo()],
  });
</script>
```

## Usage

Create links pointing to Vidyard video URLs:

```html
<div id="gallery">
  <a href="https://play.vidyard.com/abc123def">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <a href="https://video.vidyard.com/watch/abc123def">
    <img src="/thumbnails/video2.jpg" alt="Video 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { vidyardVideo } from 'vistaview/extensions/vidyard-video';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [vidyardVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses Vidyard video URLs containing video IDs.

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Vidyard player controls available
- **High quality** - Videos play at the best available quality

## Video Size

The extension creates videos with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Bundle Size

- **ESM:** 2.73 KB (1.24 KB gzip)
- **UMD:** 13.75 KB (4.19 KB gzip)

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Vidyard
- **Vidyard account required** - Videos must be hosted on Vidyard

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Vimeo](/extensions/vimeo-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
