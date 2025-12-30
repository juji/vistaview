# VistaView

> ⚠️ **Not Ready for Production** — This library is currently under active development and is not yet stable. APIs may change without notice. Use at your own risk.

A lightweight, modern image lightbox library for the web. Zero dependencies, framework-agnostic, and highly customizable.

## Features

- 🪶 **Lightweight** — ~41KB ESM (~10KB gzip), minimal footprint
- 📱 **Touch-first** — Swipe gestures for navigation and closing, pinch-to-zoom support
- 🎨 **Customizable** — Configurable controls, animations, and styling via CSS variables
- ♿ **Accessible** — Keyboard navigation, ARIA labels, reduced motion support
- 🔧 **Framework-agnostic** — Works with vanilla JS, React, Vue, Svelte, Solid, or any framework
- 🖼️ **Progressive loading** — Low-res thumbnails → high-res images with smooth transitions
- 🔍 **Smart zoom** — Pan and zoom with momentum physics, respects actual image resolution
- 🎯 **Pointer-aware** — Advanced multi-touch tracking with context menu prevention
- 🎬 **Video embeds** — Support for YouTube, Vimeo, Dailymotion, Wistia, Vidyard, Streamable
- 🗺️ **Map embeds** — Support for Google Maps, Mapbox, OpenStreetMap with interactive controls

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

### Using an array of images

```js
vistaView({
  elements: [
    { src: '/images/photo1.jpg', alt: 'Photo 1' },
    {
      src: '/images/photo2-800.jpg',
      alt: 'Photo 2',
      srcSet: '/images/photo2-800.jpg 800w, /images/photo2-1200.jpg 1200w',
    },
  ],
});
```

**Note:** When using an array of image objects, thumbnails are not supported. Use DOM elements (anchor tags or img tags) if you need progressive loading from thumbnails.

## Options

```ts
import { vistaView } from 'vistaview';

vistaView({
  // Required: specify elements (string selector or array)
  elements: string | VistaImgConfig[],

  // Optional configuration
  animationDurationBase: 333, // Base animation duration in ms (default: 333)
  maxZoomLevel: 2, // Maximum zoom multiplier (default: 2)
  preloads: 1, // Number of adjacent images to preload on each side (default: 1)
  keyboardListeners: true, // Enable keyboard navigation (default: true)
  arrowOnSmallScreens: false, // Show prev/next arrows on screens < 768px (default: false)
  rapidLimit: 222, // Minimum time between rapid actions in ms (default: 222)
  initialZIndex: 1, // Starting z-index for the lightbox (optional, no default)

  // Control placement (defaults shown)
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
  },

  // Events
  onOpen: (vistaView) => {}, // Called when lightbox opens
  onClose: (vistaView) => {}, // Called when lightbox closes
  onImageView: (data) => {}, // Called when viewing an image (including on open)

  // Custom behavior functions (advanced)
  initFunction: (vistaView) => {}, // Custom initialization (runs on open)
  setupFunction: (data) => {}, // Custom setup when navigating
  transitionFunction: (data, abortSignal) => {}, // Custom transition animation (returns cleanup function and promise)
  closeFunction: (vistaView) => {}, // Custom cleanup on close
});
```

## Default Controls

| Control        | Description                               |
| -------------- | ----------------------------------------- |
| `indexDisplay` | Shows current image index (e.g., "1 / 5") |
| `zoomIn`       | Zoom into the image                       |
| `zoomOut`      | Zoom out of the image                     |
| `close`        | Close the lightbox                        |
| `description`  | Shows the image alt text                  |

**Note:** Controls can be either built-in control names (strings) or extension instances. See the [Extensions](#extensions) section for adding additional functionality like download buttons or image stories.

## Extensions

VistaView provides optional extensions for additional functionality. Extensions are available in both ESM and UMD formats.

👉 **[View detailed extension documentation and usage examples](./extensions.md)**

👉 **[Learn how to create your own extensions](./extensions-authoring.md)**

### Available Extensions

**UI Extensions:**

- **`download`** — Adds a download button to save the current high-resolution image (1.42 KB ESM / 1.41 KB UMD)
- **`image-story`** — Display rich HTML content alongside images with XSS protection (33.60 KB ESM / 25.28 KB UMD)

**Video Platform Extensions:**

- **`youtube-video`** — Embed YouTube videos (3.10 KB ESM / 14.07 KB UMD)
- **`vimeo-video`** — Embed Vimeo videos (2.65 KB ESM / 13.69 KB UMD)
- **`dailymotion-video`** — Embed Dailymotion videos (2.80 KB ESM / 13.82 KB UMD)
- **`wistia-video`** — Embed Wistia videos (2.93 KB ESM / 13.92 KB UMD)
- **`vidyard-video`** — Embed Vidyard videos (2.73 KB ESM / 13.75 KB UMD)
- **`streamable-video`** — Embed Streamable videos (2.69 KB ESM / 13.73 KB UMD)

**Map Extensions:**

- **`google-maps`** — Embed Google Maps (requires API key) (3.65 KB ESM / 14.56 KB UMD)
- **`mapbox`** — Embed Mapbox GL JS interactive maps (requires access token) (4.99 KB ESM / 15.63 KB UMD)
- **`openstreetmap`** — Embed OpenStreetMap with Leaflet.js (free, no API key) (4.79 KB ESM / 15.43 KB UMD)

**Development Extensions:**

- **`logger`** — Debug extension that logs all lifecycle events (0.61 KB ESM / 0.76 KB UMD)

## Exported Types & Functions

VistaView exports all types for TypeScript users, plus helper functions and internal classes:

```ts
import { vistaView } from 'vistaview';

// All types are exported via `export type *`
import type {
  // Configuration types
  VistaParamsNeo, // Full options including `elements`
  VistaOpt, // Base options (without `elements`)

  // Image types
  VistaImgConfig, // Image configuration: { src, alt?, srcSet? }
  VistaImgOrigin, // Origin element properties
  VistaParsedElm, // Parsed element return type from parseElement

  // Interface types
  VistaInterface, // Return type from vistaView()
  VistaData, // Data passed to events/functions
  VistaImageState, // Image state interface

  // Function types
  VistaImageSetupFn, // Type for imageSetupFunction
  VistaTransitionFn, // Type for transitionFunction
  VistaOpenFn, // Type for openFunction
  VistaCloseFn, // Type for closeFunction
  VistaInitFn, // Type for initFunction

  // Control types
  VistaDefaultCtrl, // Built-in control names
  VistaExtension, // Extension interface for adding functionality

  // Pointer types
  VistaPointerArgs, // Pointer system arguments
  VistaPointer, // Single pointer state
  VistaPointerListenerArgs, // Internal pointer listener args
  VistaPointerListener, // Internal pointer listener type
  VistaExternalPointerListenerArgs, // External pointer listener args
} from 'vistaview';

// Optional: Default behavior functions and internal classes (advanced usage)
import {
  DefaultOptions, // Default configuration options
  imageSetup, // Default image setup function
  init, // Default init function (runs on class initialization)
  open, // Default open function (runs when viewer opens)
  close, // Default close function
  transition, // Default transition function
  VistaImageEvent, // Event handling system
  VistaHiresTransition, // High-resolution image transition manager
  VistaBox, // Base class for image containers
  VistaImage, // Individual image instance class
  VistaPointers, // Multi-pointer tracking system
  VistaState, // State management class
  VistaView, // Main view controller class
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

- `autumn-amber` - Warm oranges and browns with earthy tones
- `cotton-candy` - Playful pastel pink with soft styling
- `dark-rounded` - Dark theme with rounded corners and animated navigation buttons
- `ember-glow` - Dark theme with orange glow effects
- `forest-moss` - Earthy greens inspired by nature
- `green-lake` - Calming teal and green palette with smooth transitions
- `ice-crystal` - Cool light blue palette with crisp styling
- `lavender-fields` - Soft purple palette with gentle animations
- `midnight-gold` - Elegant black background with gold accents
- `midnight-ocean` - Deep navy blues with cyan accents
- `mint-chocolate` - Brown and mint green combination
- `neon-nights` - Cyberpunk-inspired magenta and cyan with glowing effects
- `paper-light` - Light theme with subtle shadows and paper-like appearance
- `retro-arcade` - Bold primary colors with classic arcade aesthetics
- `soft-neutral` - Warm beige and cream tones with maximum roundness
- `stark-minimal` - Pure black and white, zero border radius, minimalist design
- `strawberry` - Vibrant pink and red gradient theme

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

| Attribute               | Description                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `data-vistaview-src`    | Full-size image URL (overrides href/src)                                                 |
| `data-vistaview-srcset` | Responsive image srcset (overrides native srcset)                                        |
| `data-vistaview-alt`    | Alt text for lightbox (overrides the element's alt attribute if you want different text) |

**Note:** Thumbnails are automatically detected from the element's `src` attribute or nested `<img>` element.

## Keyboard Navigation

| Key       | Action         |
| --------- | -------------- |
| `←` Left  | Previous image |
| `→` Right | Next image     |
| `↑` Up    | Zoom in        |
| `↓` Down  | Zoom out       |
| `Esc`     | Close lightbox |

## Touch Gestures

| Gesture          | Action                  |
| ---------------- | ----------------------- |
| Swipe left/right | Navigate between images |
| Swipe up/down    | Close lightbox          |
| Pinch in/out     | Zoom in/out             |
| Drag             | Pan image (when zoomed) |

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
✓ 60 modules transformed.

[vite:dts] Start generate declaration files...
dist/styles/stark-minimal.css            1.45 kB │ gzip:  0.36 kB
dist/styles/dark-rounded.css             1.58 kB │ gzip:  0.38 kB
dist/styles/autumn-amber.css             1.65 kB │ gzip:  0.41 kB
dist/styles/forest-moss.css              1.65 kB │ gzip:  0.41 kB
dist/styles/green-lake.css               1.65 kB │ gzip:  0.41 kB
dist/styles/ice-crystal.css              1.65 kB │ gzip:  0.41 kB
dist/styles/soft-neutral.css             1.65 kB │ gzip:  0.40 kB
dist/styles/strawberry.css               1.65 kB │ gzip:  0.41 kB
dist/styles/lavender-fields.css          1.65 kB │ gzip:  0.41 kB
dist/styles/cotton-candy.css             1.68 kB │ gzip:  0.42 kB
dist/styles/midnight-ocean.css           1.70 kB │ gzip:  0.42 kB
dist/styles/midnight-gold.css            1.71 kB │ gzip:  0.42 kB
dist/styles/mint-chocolate.css           1.72 kB │ gzip:  0.43 kB
dist/styles/neon-nights.css              1.78 kB │ gzip:  0.45 kB
dist/styles/paper-light.css              1.86 kB │ gzip:  0.45 kB
dist/styles/ember-glow.css               1.89 kB │ gzip:  0.46 kB
dist/styles/retro-arcade.css             2.03 kB │ gzip:  0.49 kB
dist/styles/extensions/image-story.css   2.52 kB │ gzip:  0.72 kB
dist/style.css                           7.06 kB │ gzip:  1.72 kB
dist/extensions/logger.js                0.61 kB │ gzip:  0.23 kB
dist/svelte.js                           0.77 kB │ gzip:  0.31 kB
dist/solid.js                            0.77 kB │ gzip:  0.31 kB
dist/vue.js                              0.82 kB │ gzip:  0.32 kB
dist/extensions/download.js              1.42 kB │ gzip:  0.70 kB
dist/react.js                            1.45 kB │ gzip:  0.41 kB
dist/extensions/vimeo-video.js           2.65 kB │ gzip:  1.24 kB
dist/extensions/streamable-video.js      2.69 kB │ gzip:  1.24 kB
dist/extensions/vidyard-video.js         2.73 kB │ gzip:  1.24 kB
dist/extensions/dailymotion-video.js     2.80 kB │ gzip:  1.26 kB
dist/extensions/wistia-video.js          2.93 kB │ gzip:  1.35 kB
dist/extensions/youtube-video.js         3.10 kB │ gzip:  1.42 kB
dist/extensions/google-maps.js           3.65 kB │ gzip:  1.60 kB
dist/extensions/openstreetmap.js         4.79 kB │ gzip:  1.90 kB
dist/extensions/mapbox.js                4.99 kB │ gzip:  1.93 kB
dist/vista-box-CQvGrjln.js              15.00 kB │ gzip:  3.93 kB
dist/extensions/image-story.js          33.60 kB │ gzip: 10.84 kB
dist/vistaview.js                       40.72 kB │ gzip: 10.04 kB
[vite:dts] Declaration files built in 721ms.

✓ built in 947ms

> vistaview@0.10.2 build:umd

vite v6.4.1 building for production...
✓ 21 modules transformed.

[vite:dts] Start generate declaration files...
dist/vistaview.umd.js  41.81 kB │ gzip: 11.38 kB
[vite:dts] Declaration files built in 809ms.

✓ built in 920ms
vite v6.4.1 building for production...
✓ 1 modules transformed.

[vite:dts] Start generate declaration files...
dist/extensions/download.umd.js  1.41 kB │ gzip: 0.79 kB
[vite:dts] Declaration files built in 717ms.

✓ built in 757ms
vite v6.4.1 building for production...
✓ 1 modules transformed.

[vite:dts] Start generate declaration files...
dist/extensions/logger.umd.js  0.76 kB │ gzip: 0.37 kB
[vite:dts] Declaration files built in 724ms.

✓ built in 748ms
vite v6.4.1 building for production...
✓ 5 modules transformed.

[vite:dts] Start generate declaration files...
dist/extensions/image-story.umd.js  25.28 kB │ gzip: 9.81 kB
[vite:dts] Declaration files built in 754ms.

✓ built in 855ms
```

## License

MIT
