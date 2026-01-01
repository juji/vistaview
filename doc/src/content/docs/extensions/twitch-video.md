---
title: Twitch Video Extension
description: Embed Twitch videos and clips in the lightbox
---

The Twitch Video extension allows you to embed Twitch videos and clips in the VistaView lightbox instead of images.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { twitchVideo } from 'vistaview/extensions/twitch-video';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  extensions: [twitchVideo()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/twitch-video.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [VistaView.twitchVideo()],
  });
</script>
```

## Usage

Create links pointing to Twitch video or clip URLs:

```html
<div id="gallery">
  <!-- Twitch Video -->
  <a href="https://www.twitch.tv/videos/1234567890">
    <img src="/thumbnails/video1.jpg" alt="Video 1" />
  </a>

  <!-- Twitch Clip -->
  <a href="https://clips.twitch.tv/ClipSlugHere">
    <img src="/thumbnails/clip1.jpg" alt="Clip 1" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import { twitchVideo } from 'vistaview/extensions/twitch-video';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
    extensions: [twitchVideo()],
  });
</script>
```

## Supported URL Formats

The extension automatically detects and parses these Twitch URL formats:

- `https://www.twitch.tv/videos/VIDEO_ID` (VODs)
- `https://twitch.tv/videos/VIDEO_ID`
- `https://clips.twitch.tv/CLIP_SLUG` (Clips)
- `https://www.twitch.tv/CHANNEL/clip/CLIP_SLUG`

## Features

- **Autoplay** - Videos automatically start playing when opened
- **Responsive sizing** - Videos maintain 16:9 aspect ratio
- **Full controls** - All Twitch player controls available
- **Clips support** - Both VODs and clips are supported

## Video Size

The extension creates videos with a maximum width of 800px (or window width, whichever is smaller) while maintaining a 16:9 aspect ratio.

## Bundle Size

- **ESM:** 3.60 KB (1.55 KB gzip)
- **UMD:** 14.82 KB (4.54 KB gzip)

## Requirements

The Twitch Player API requires a valid parent domain. The extension automatically sets this to `window.location.hostname`, but for local development you may need to add `localhost` to your Twitch app settings.

## Limitations

- **No zoom controls** - Videos cannot be zoomed like images
- **Requires internet connection** - Videos stream from Twitch
- **Parent domain requirement** - Twitch requires parent domain parameter
- **Deleted/private videos** - Will not load if video is unavailable

## TypeScript

Full TypeScript support:

```typescript
import type { VistaExtension } from 'vistaview';
import { twitchVideo } from 'vistaview/extensions/twitch-video';

const extension: VistaExtension = twitchVideo();
```

## Troubleshooting

### Video not loading

1. Check if the video/clip is public and available
2. Verify the URL format is correct
3. Check browser console for errors
4. Ensure parent domain is properly configured

### Local development issues

For `localhost` development, Twitch may require you to add it to your app's allowed domains.

## Next Steps

- Try other video extensions: [YouTube](/extensions/youtube-video), [Vimeo](/extensions/vimeo-video)
- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
