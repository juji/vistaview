# VistaView

A lightweight, modern image lightbox library for the web. Zero dependencies, framework-agnostic, and highly customizable.

## Features

- 🪶 **Lightweight** — Minimal footprint, no external dependencies
- 📱 **Mobile-first** — Touch gestures, smooth animations, responsive design
- 🎨 **Customizable** — Configurable controls, animations, and styling
- ♿ **Accessible** — Keyboard navigation, reduced motion support
- 🔧 **Framework-agnostic** — Works with vanilla JS, React, Vue, or any framework
- 🖼️ **Progressive loading** — Low-res thumbnails → high-res images with smooth transitions
- 🔍 **Zoom support** — Zoom in/out with buttons, respects actual image resolution

## Installation

```bash
npm install vistaview
```

## Quick Start

### Using anchor elements (recommended)

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg" data-vistaview-width="1920" data-vistaview-height="1080">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg" data-vistaview-width="1280" data-vistaview-height="720">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import 'vistaview/style.css';

  vistaView({
    parent: document.getElementById('gallery'),
  });
</script>
```

### Using data attributes on images

```html
<div id="gallery">
  <img
    src="/images/thumb1.jpg"
    data-vistaview-src="/images/full1.jpg"
    data-vistaview-width="1920"
    data-vistaview-height="1080"
    alt="Photo 1"
  />
</div>
```

### Using a CSS selector

```js
vistaView({
  elements: '.gallery-image',
});
```

### Using an array of images

```js
vistaView({
  elements: [
    { src: '/images/photo1.jpg', width: 1920, height: 1080, alt: 'Photo 1' },
    { src: '/images/photo2.jpg', width: 1280, height: 720, alt: 'Photo 2' },
  ],
});
```

## Options

```ts
vistaView({
  // Required: specify either parent OR elements
  parent: HTMLElement, // Container element with images/anchors
  elements: string | NodeList | Array, // Selector, NodeList, or array of images

  // Optional configuration
  animationDurationBase: 333, // Base animation duration in ms
  initialZIndex: 1, // Starting z-index for the lightbox
  detectReducedMotion: true, // Respect prefers-reduced-motion
  zoomStep: 300, // Pixels to zoom per step

  // Control placement
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    topCenter: [],
    bottomLeft: [],
    bottomCenter: [],
    bottomRight: [],
  },
});
```

## Default Controls

| Control        | Description                               |
| -------------- | ----------------------------------------- |
| `indexDisplay` | Shows current image index (e.g., "1 / 5") |
| `zoomIn`       | Zoom into the image                       |
| `zoomOut`      | Zoom out of the image                     |
| `close`        | Close the lightbox                        |

## Custom Controls

You can add custom controls by providing an object with `name`, `icon`, and `onClick`:

```js
import { vistaView, getDownloadButton } from 'vistaview';

vistaView({
  parent: document.getElementById('gallery'),
  controls: {
    topRight: [
      'zoomIn',
      'zoomOut',
      getDownloadButton(), // Example: Built-in download helper
      {
        name: 'share',
        icon: '<svg>...</svg>',
        onClick: (image) => {
          navigator.share({ url: image.src });
        },
      },
      'close',
    ],
  },
});
```

## Styling

VistaView uses CSS custom properties for easy theming:

```css
:root {
  --vistaview-bg-color: #000000;
  --vistaview-text-color: #ffffff;
  --vistaview-border-radius: 8px;
  --vistaview-background-blur: 10px;
  --vistaview-background-opacity: 0.8;
  --vistaview-animation-duration: 333;
}
```

## Data Attributes

| Attribute                 | Description                                |
| ------------------------- | ------------------------------------------ |
| `data-vistaview-src`      | Full-size image URL (for `<img>` elements) |
| `data-vistaview-width`    | Full-size image width in pixels            |
| `data-vistaview-height`   | Full-size image height in pixels           |
| `data-vistaview-alt`      | Alt text for the image                     |
| `data-vistaview-smallsrc` | Thumbnail URL (optional)                   |

## Browser Support

VistaView works in all modern browsers (Chrome, Firefox, Safari, Edge).

## License

MIT
