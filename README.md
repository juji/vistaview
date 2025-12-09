# VistaView

A lightweight, modern image lightbox library for the web. Zero dependencies, framework-agnostic, and highly customizable.

## Features

- 🪶 **Lightweight** — Minimal footprint, no external dependencies
- 📱 **Mobile-first** — Touch gestures, smooth animations, responsive design
- 🎨 **Customizable** — Configurable controls, animations, and styling
- ♿ **Accessible** — Keyboard navigation, reduced motion support
- 🔧 **Framework-agnostic** — Works with vanilla JS, React, Vue, Svelte, Solid, or any framework
- 🖼️ **Progressive loading** — Low-res thumbnails → high-res images with smooth transitions
- 🔍 **Zoom support** — Zoom in/out with buttons, respects actual image resolution

## Installation

```bash
npm install vistaview
```

### Using CDN (UMD)

For quick prototyping or non-bundler environments, use the UMD build via CDN:

```html
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/vistaview.css" />
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>

<script>
  // VistaView is available globally
  VistaView.vistaView({
    elements: '#gallery a',
  });
</script>
```

## Quick Start

### Using anchor elements (recommended)

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import 'vistaview/style.css';

  vistaView({
    elements: '#gallery a',
  });
</script>
```

### Using data attributes on images

```html
<div id="gallery">
  <img src="/images/thumb1.jpg" data-vistaview-src="/images/full1.jpg" alt="Photo 1" />
</div>
```

### Using a CSS selector

```js
vistaView({
  elements: '#gallery img',
});
```

### Using a NodeList

```js
vistaView({
  elements: document.querySelectorAll('.gallery-image'),
});
```

### Using an array of images

```js
vistaView({
  elements: [
    { src: '/images/photo1.jpg', thumb: '/images/thumb1.jpg', alt: 'Photo 1' },
    { src: '/images/photo2.jpg', thumb: '/images/thumb2.jpg', alt: 'Photo 2' },
  ],
});
```

## Options

```ts
import { vistaView, vistaViewDownload } from 'vistaview'

vistaView({
  // Required: specify elements (string selector, NodeList, or array)
  elements: string | NodeList | VistaViewImage[],

  // Optional configuration
  animationDurationBase: 333, // Base animation duration in ms (default: 333)
  initialZIndex: 1, // Starting z-index for the lightbox (default: 1)
  detectReducedMotion: true, // Respect prefers-reduced-motion (default: true)
  zoomStep: 500, // Pixels to zoom per step (default: 500)
  maxZoomLevel: 2, // Maximum zoom multiplier (default: 2)
  touchSpeedThreshold: 0.7, // Swipe speed threshold for navigation (default: 0.7)
  preloads: 1, // Number of adjacent images to preload on each side (default: 1)
  keyboardListeners: true, // Enable keyboard navigation (default: true)

  // Control placement (defaults shown)
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', vistaViewDownload(), 'close'],
    topCenter: [],
    bottomLeft: [],
    bottomCenter: ['description'],
    bottomRight: [],
  },

  // Events
  onOpen: (data) => {},      // Called when lightbox opens
  onClose: (data) => {},     // Called when lightbox closes
  onImageView: (data) => {}, // Called when viewing an image (including on open)

  // Custom behavior functions (advanced)
  initFunction: (vistaView) => {},       // Custom initialization
  setupFunction: (data) => {},           // Custom setup when navigating
  transitionFunction: (data) => image,   // Custom transition animation
  closeFunction: (vistaView) => {},      // Custom cleanup on close
});
```

## Default Controls

| Control               | Description                               |
| --------------------- | ----------------------------------------- |
| `indexDisplay`        | Shows current image index (e.g., "1 / 5") |
| `zoomIn`              | Zoom into the image                       |
| `zoomOut`             | Zoom out of the image                     |
| `vistaViewDownload()` | Download the current image                |
| `close`               | Close the lightbox                        |
| `description`         | Shows the image alt text                  |

## Custom Controls

Controls are merged with defaults—only the positions you specify are replaced. Provide an object with `name`, `icon`, and `onClick`:

```js
import { vistaView, vistaViewDownload } from 'vistaview';

vistaView({
  elements: '#gallery a',
  controls: {
    topRight: [
      'zoomIn',
      'zoomOut',
      vistaViewDownload(), // Example: Built-in download helper
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

## Exported Types & Functions

VistaView exports all types for TypeScript users, plus default behavior functions for customization:

```ts
import {
  vistaView,
  vistaViewDownload,
  DefaultOptions,
  // Default behavior functions (can be used as starting points)
  defaultInit,
  defaultSetup,
  defaultTransition,
  defaultClose,
  setTouchActions,
  removeTouchActions,
} from 'vistaview';

import type {
  VistaViewParams, // Full options including `elements`
  VistaViewOptions, // Base options (without `elements`)
  VistaViewImage, // Image object: { src, alt?, thumb? }
  VistaViewImageIndexed, // Image with index and DOM references
  VistaViewInterface, // Return type from vistaView()
  VistaViewData, // Data passed to events/functions
  VistaViewSetupFunction, // Type for setupFunction
  VistaViewTransitionFunction, // Type for transitionFunction
  VistaViewCloseFunction, // Type for closeFunction
  VistaViewInitFunction, // Type for initFunction
  VistaViewCustomControl, // Custom control definition
} from 'vistaview';
```

## Styling

VistaView uses CSS custom properties for easy theming:

```css
:root {
  --vistaview-bg-color: #000000;
  --vistaview-text-color: #ffffff;
  --vistaview-background-blur: 10px;
  --vistaview-background-opacity: 0.8;
  --vistaview-animation-duration: 333;
}
```

## Data Attributes

| Attribute              | Description                                |
| ---------------------- | ------------------------------------------ |
| `data-vistaview-src`   | Full-size image URL (for `<img>` elements) |
| `data-vistaview-alt`   | Alt text for the image                     |
| `data-vistaview-thumb` | Thumbnail URL (optional)                   |

## Keyboard Navigation

| Key       | Action         |
| --------- | -------------- |
| `←` Left  | Previous image |
| `→` Right | Next image     |
| `↑` Up    | Zoom in        |
| `↓` Down  | Zoom out       |
| `Esc`     | Close lightbox |

## Browser Support

VistaView works in all modern browsers (Chrome, Firefox, Safari, Edge).

## Framework Integration

VistaView provides official bindings for popular frameworks:

- **React** — `useVistaView` hook and `<VistaView>` component
- **Vue 3** — `useVistaView` composable and `<VistaView>` component
- **Svelte** — `useVistaView` hook
- **Solid** — `useVistaView` hook and `<VistaView>` component
- **Angular** — Manual setup example
- **Vanilla JS** — Works out of the box

👉 **[See full framework integration guide](./framework-integration.md)**

### Quick Example (React)

```tsx
import { useVistaView } from 'vistaview/react';
import 'vistaview/style.css';

function Gallery() {
  const { open, close, next, prev } = useVistaView({ elements: '#gallery a' });
  return (
    <div id="gallery">
      <a href="/full.jpg">
        <img src="/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}
```

## License

MIT
