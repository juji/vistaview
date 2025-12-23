# VistaView

A lightweight, modern image lightbox library for the web. Zero dependencies, framework-agnostic, and highly customizable.

## Features

- 🪶 **Lightweight** — ~47KB ESM (~11KB gzip), minimal footprint, zero dependencies
- 📱 **Touch-first** — Swipe gestures for navigation and closing, pinch-to-zoom support
- 🎨 **Customizable** — Configurable controls, animations, and styling via CSS variables
- ♿ **Accessible** — Keyboard navigation, ARIA labels, reduced motion support
- 🔧 **Framework-agnostic** — Works with vanilla JS, React, Vue, Svelte, Solid, or any framework
- 🖼️ **Progressive loading** — Low-res thumbnails → high-res images with smooth transitions
- 🔍 **Smart zoom** — Pan and zoom with momentum physics, respects actual image resolution
- 🎯 **Pointer-aware** — Advanced multi-touch tracking with context menu prevention

## Installation

```bash
npm install vistaview
```

### Using CDN (UMD)

For quick prototyping or non-bundler environments, use the UMD build via CDN:

```html
<!-- unpkg -->
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/style.css" />
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>

<!-- or jsDelivr -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vistaview/dist/style.css" />
<script src="https://cdn.jsdelivr.net/npm/vistaview/dist/vistaview.umd.js"></script>

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
import { vistaView, vistaViewDownload } from 'vistaview';

vistaView({
  // Required: specify elements (string selector, NodeList, or array)
  elements: string | NodeList | VistaImg[],

  // Optional configuration
  animationDurationBase: 333, // Base animation duration in ms (default: 333)
  initialZIndex: 1, // Starting z-index for the lightbox (default: 1)
  maxZoomLevel: 2, // Maximum zoom multiplier (default: 2)
  preloads: 1, // Number of adjacent images to preload on each side (default: 1)
  keyboardListeners: true, // Enable keyboard navigation (default: true)
  arrowOnSmallScreens: false, // Show prev/next arrows on screens < 768px (default: false)
  rapidLimit: 100, // Minimum time between rapid actions in ms (default: 100)

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
  onOpen: (vistaView) => {}, // Called when lightbox opens
  onClose: (vistaView) => {}, // Called when lightbox closes
  onImageView: (data) => {}, // Called when viewing an image (including on open)

  // Custom behavior functions (advanced)
  initFunction: (vistaView) => {}, // Custom initialization (runs on open)
  setupFunction: (data) => {}, // Custom setup when navigating
  transitionFunction: (data, abortSignal) => Promise<void>, // Custom transition animation
  closeFunction: (vistaView) => {}, // Custom cleanup on close
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

VistaView exports all types for TypeScript users, plus helper functions:

```ts
import {
  vistaView,
  vistaViewDownload, // Helper function for download control
  DefaultOptions, // Default configuration options
  setup, // Default setup function
  init, // Default init function
  close, // Default close function
  transition, // Default transition function
} from 'vistaview';

import type {
  VistaParams, // Full options including `elements`
  VistaOpt, // Base options (without `elements`)
  VistaImg, // Image object: { src, alt?, thumb? }
  VistaImgIdx, // Image with index and DOM references
  VistaInterface, // Return type from vistaView()
  VistaData, // Data passed to events/functions
  VistaSetupFn, // Type for setupFunction
  VistaTransitionFn, // Type for transitionFunction
  VistaCloseFn, // Type for closeFunction
  VistaInitFn, // Type for initFunction
  VistaCustomCtrl, // Custom control definition
  VistaDefaultCtrl, // Built-in control names
  VistaElmProps, // Element property interface
} from 'vistaview';
```

## Styling

### CSS Import

VistaView CSS is now separate from the JavaScript bundle for better control:

```js
import 'vistaview/style.css';
```

### Theme System

VistaView supports custom themes that can be imported separately:

```js
import 'vistaview/style.css'; // Base styles (required)
import 'vistaview/styles/dark-rounded.css'; // Optional theme
```

Available themes:

- `dark-rounded` - Dark theme with rounded corners and animated navigation buttons

### CSS Custom Properties

VistaView uses CSS custom properties for easy customization:

```css
:root {
  --vvw-bg-color: #000000; /* Background color */
  --vvw-text-color: #ffffff; /* Text color */
  --vvw-bg-blur: 10px; /* Background blur amount */
  --vvw-bg-opacity: 0.8; /* Background opacity */
  --vvw-anim-dur: 333; /* Animation duration in ms */
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

## Touch Gestures

| Gesture          | Action                    |
| ---------------- | ------------------------- |
| Swipe left/right | Navigate between images   |
| Swipe up/down    | Close lightbox            |
| Pinch in/out     | Zoom in/out (when zoomed) |
| Drag             | Pan image (when zoomed)   |
| Single tap       | Toggle UI visibility      |

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

## Accessibility

VistaView is built with accessibility in mind:

- **Screen reader support** - ARIA labels and live regions announce navigation and image information
- **Keyboard navigation** - Full keyboard control (can be disabled with `keyboardListeners: false`)
- **Reduced motion** - Respects `prefers-reduced-motion` user preference
- **Focus management** - Proper focus handling when opening/closing
- **Error announcements** - Failed image loads are announced to screen readers
- **Semantic HTML** - Proper button elements with descriptive labels

## Last built

```
vite v6.4.1 building for production...
✓ 24 modules transformed.

[vite:dts] Start generate declaration files...
dist/styles/dark-rounded.css   1.55 kB │ gzip:  0.41 kB
dist/style.css                 6.74 kB │ gzip:  1.62 kB
dist/svelte.js                 0.72 kB │ gzip:  0.31 kB
dist/solid.js                  1.38 kB │ gzip:  0.61 kB
dist/vue.js                    1.56 kB │ gzip:  0.66 kB
dist/react.js                  1.96 kB │ gzip:  0.64 kB
dist/vistaview.js             46.80 kB │ gzip: 11.34 kB
[vite:dts] Declaration files built in 667ms.

✓ built in 787ms
vite v6.4.1 building for production...
✓ 18 modules transformed.

[vite:dts] Start generate declaration files...
dist/vistaview.umd.js  35.22 kB │ gzip: 9.85 kB
[vite:dts] Declaration files built in 654ms.

✓ built in 755ms
```

## License

MIT
