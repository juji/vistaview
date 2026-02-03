---
title: Download Extension
description: Add a download button to save images
---

The Download extension adds a button that allows users to download the currently viewed high-resolution image.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery > a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
```

### UMD (CDN)

```html
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/main/dist/extensions/download.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery > a',
    controls: {
      topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
    },
    extensions: [VistaView.download()],
  });
</script>
```

## Features

- **Download button** - Adds a download control to the lightbox
- **Automatic filename** - Uses the image's alt text as the download filename
- **Loading state** - Shows a pulsing animation while downloading
- **Cross-origin support** - Handles CORS-protected images via fetch

## Usage

The download button appears in the control area you specify. When clicked, it:

1. Fetches the high-resolution image
2. Creates a blob URL
3. Triggers a download with the image's alt text as the filename
4. Cleans up the temporary blob URL

## Customization

### Control Position

```javascript
vistaView({
  elements: '#gallery > a',
  controls: {
    topRight: ['download', 'close'], // Position at top right
    // Or:
    topLeft: ['download'], // Position at top left
    bottomRight: ['download'], // Position at bottom right
  },
  extensions: [download()],
});
```

### Styling

The download button uses the standard VistaView control styling and can be customized with CSS:

```css
.vvw-ctrl-download {
  --vvw-ui-bg-color: rgba(0, 150, 255, 0.3);
}

.vvw-ctrl-download:hover {
  --vvw-ui-bg-color: rgba(0, 150, 255, 0.5);
}

/* Pulsing animation during download */
.vvw-ctrl-download.vvw--pulsing {
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
```

## Bundle Size

- **ESM:** 1.42 KB (0.70 KB gzip)
- **UMD:** 1.41 KB (0.79 KB gzip)

## Browser Compatibility

Works in all modern browsers that support:

- Fetch API
- Blob URLs
- Download attribute on anchor elements

For older browsers, consider using a polyfill or the extension will gracefully fail.

## Example

```javascript
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery > a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
```

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Beautiful Sunset" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Mountain Landscape" />
  </a>
</div>
```

When users click the download button, the image will be saved with the filename based on the alt text (e.g., "Beautiful Sunset.jpg").

## Next Steps

- Explore other [extensions](/extensions/overview)
- Learn about [creating custom extensions](/extensions/authoring)
- See the [configuration options](/core/configuration/complete)
