# VistaView

A lightweight, zero-dependency image lightbox with smooth animations, touch/pinch support, zoom, and an extension system. Works with vanilla JS or any framework.

**[Documentation](https://vistaview.jujiplay.com)**

## Installation

```bash
npm install vistaview
# yarn add vistaview
# pnpm add vistaview
```

## Quick Start

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>
```

```js
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

const gallery = vistaView({ elements: '#gallery a' });
```

You can also pass an array of objects instead of a CSS selector:

```js
vistaView({
  elements: [
    { src: '/images/photo1.jpg', alt: 'Photo 1' },
    { src: '/images/photo2.jpg', alt: 'Photo 2', srcSet: '/images/photo2-800.jpg 800w, /images/photo2-1200.jpg 1200w' },
  ],
});
```

### CDN (no bundler)

```html
<link rel="stylesheet" href="https://unpkg.com/vistaview/main/dist/style.css" />
<script src="https://unpkg.com/vistaview/main/dist/vistaview.umd.js"></script>
<script>
  VistaView.vistaView({ elements: '#gallery a' });
</script>
```

## API

`vistaView(options)` returns an instance with these methods:

| Method | Description |
|--------|-------------|
| `open(index?)` | Open the lightbox, optionally at a given index |
| `close()` | Close the lightbox (returns Promise) |
| `next()` | Go to the next image |
| `prev()` | Go to the previous image |
| `view(index)` | Jump to a specific index |
| `getCurrentIndex()` | Returns the current index |
| `zoomIn()` | Zoom in |
| `zoomOut()` | Zoom out |
| `reset()` | Re-scan elements (call after DOM changes) |
| `destroy()` | Tear down the instance and remove listeners |

### Options

```ts
vistaView({
  elements: '#gallery a',        // CSS selector or VistaImgConfig[]
  animationDurationBase: 300,    // Base animation duration in ms
  maxZoomLevel: 2,               // Maximum zoom multiplier
  preloads: 1,                   // Number of adjacent images to preload
  keyboardListeners: true,       // Enable arrow/escape key navigation
  arrowOnSmallScreens: false,    // Show nav arrows on small screens
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
  },
  extensions: [],
  onOpen: (vistaView) => {},
  onClose: (vistaView) => {},
  onImageView: (data, vistaView) => {},
  onContentChange: (content, vistaView) => {},
});
```

## Framework Bindings

### React

```tsx
import { VistaView } from 'vistaview/react';
import 'vistaview/style.css';

function Gallery() {
  return (
    <VistaView selector="> a">
      <a href="/images/full.jpg"><img src="/images/thumb.jpg" alt="Photo" /></a>
    </VistaView>
  );
}
```

For imperative control, use the ref:

```tsx
import { useRef } from 'react';
import { VistaView } from 'vistaview/react';
import type { VistaComponentRef } from 'vistaview/react';

const ref = useRef<VistaComponentRef>(null);
// ref.current.vistaView.open(0)
<VistaView ref={ref} selector="> a">...</VistaView>
```

Or use the hook directly:

```tsx
import { useVistaView } from 'vistaview/react';

const gallery = useVistaView({ elements: '#gallery > a' });
```

> Add `'use client'` at the top of the file when using Next.js or other RSC frameworks.

### Vue

```vue
<script setup>
import { VistaView } from 'vistaview/vue';
import 'vistaview/style.css';
</script>

<template>
  <VistaView selector="> a">
    <a href="/images/full.jpg"><img src="/images/thumb.jpg" alt="Photo" /></a>
  </VistaView>
</template>
```

### Svelte

```svelte
<script>
  import { VistaView } from 'vistaview/svelte';
  import 'vistaview/style.css';
</script>

<VistaView selector="> a">
  <a href="/images/full.jpg"><img src="/images/thumb.jpg" alt="Photo" /></a>
</VistaView>
```

### Solid

```tsx
import { VistaView } from 'vistaview/solid';
import 'vistaview/style.css';

function Gallery() {
  return (
    <VistaView selector="> a">
      <a href="/images/full.jpg"><img src="/images/thumb.jpg" alt="Photo" /></a>
    </VistaView>
  );
}
```

## Extensions

Extensions are passed in the `extensions` array and can optionally add controls to the toolbar.

```js
import { vistaView } from 'vistaview';
import { download } from 'vistaview/extensions/download';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
  controls: { topRight: ['zoomIn', 'zoomOut', 'download', 'close'] },
  extensions: [download()],
});
```

Available extensions:

| Import path | Description |
|-------------|-------------|
| `vistaview/extensions/download` | Download button for the current image |
| `vistaview/extensions/youtube-video` | Embed YouTube videos |
| `vistaview/extensions/vimeo-video` | Embed Vimeo videos |
| `vistaview/extensions/dailymotion-video` | Embed Dailymotion videos |
| `vistaview/extensions/streamable-video` | Embed Streamable videos |
| `vistaview/extensions/vidyard-video` | Embed Vidyard videos |
| `vistaview/extensions/wistia-video` | Embed Wistia videos |
| `vistaview/extensions/google-maps` | Embed Google Maps |
| `vistaview/extensions/mapbox` | Embed Mapbox maps |
| `vistaview/extensions/openstreetmap` | Embed OpenStreetMap |
| `vistaview/extensions/image-story` | Instagram-style story layout |
| `vistaview/extensions/logger` | Debug logging |

## Development

```bash
pnpm install
pnpm dev
```

```bash
pnpm test:core   # Core library tests
pnpm test        # All packages
pnpm test:e2e    # Playwright end-to-end tests
```

## License

MIT
