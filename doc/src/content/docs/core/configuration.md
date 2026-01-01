---
title: Configuration
description: Complete configuration reference for VistaView
---

VistaView provides extensive configuration options to customize the lightbox behavior and appearance.

## Basic Configuration

```typescript
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a', // Required: selector or array of images
});
```

## Complete Options

```typescript
vistaView({
  // Required: specify elements
  elements: string | VistaImgConfig[],

  // Animation & Timing
  animationDurationBase: 333, // Base animation duration in ms
  rapidLimit: 222, // Minimum time between rapid actions in ms

  // Zoom & Navigation
  maxZoomLevel: 2, // Maximum zoom multiplier (1 = 100%, 2 = 200%, etc.)
  preloads: 1, // Number of adjacent images to preload on each side

  // UI Controls
  keyboardListeners: true, // Enable keyboard navigation
  arrowOnSmallScreens: false, // Show prev/next arrows on screens < 768px
  initialZIndex: 1, // Starting z-index for the lightbox (optional)

  // Control Placement
  controls: {
    topLeft: ['indexDisplay'], // Array of control names
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
    bottomRight: [],
    bottomCenter: [],
  },

  // Extensions
  extensions: [], // Array of extension objects

  // Event Callbacks
  onOpen: (vistaView) => {}, // Called when lightbox opens
  onClose: (vistaView) => {}, // Called when lightbox closes
  onImageView: (data) => {}, // Called when viewing an image

  // Advanced: Custom Behavior Functions
  initFunction: (vistaView) => {}, // Custom initialization
  setupFunction: (data) => {}, // Custom setup when navigating
  transitionFunction: (data, abortSignal) => {}, // Custom transition animation
  closeFunction: (vistaView) => {}, // Custom cleanup on close
});
```

## Elements Configuration

### Using CSS Selector

The most common approach - select anchor tags containing images:

```typescript
vistaView({
  elements: '#gallery a',
});
```

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
</div>
```

### Using Image Elements

Select images directly with `data-vistaview-src`:

```typescript
vistaView({
  elements: '#gallery img',
});
```

```html
<div id="gallery">
  <img src="/images/thumb.jpg" data-vistaview-src="/images/full.jpg" alt="Photo" />
</div>
```

### Using Array of Images

Pass an array of image configuration objects:

```typescript
vistaView({
  elements: [
    { src: '/images/photo1.jpg', alt: 'Photo 1' },
    {
      src: '/images/photo2.jpg',
      alt: 'Photo 2',
      srcSet: '/images/photo2-800.jpg 800w, /images/photo2-1200.jpg 1200w',
    },
  ],
});
```

**Note:** Thumbnails are not supported when using an array. Use DOM elements for progressive loading.

## Animation Options

### animationDurationBase

Controls the base duration of all animations (open, close, transitions):

```typescript
vistaView({
  elements: '#gallery a',
  animationDurationBase: 500, // Slower animations (default: 333ms)
});
```

### rapidLimit

Prevents too-fast interactions (useful for touch devices):

```typescript
vistaView({
  elements: '#gallery a',
  rapidLimit: 300, // Minimum 300ms between actions (default: 222ms)
});
```

## Zoom Options

### maxZoomLevel

Maximum zoom level allowed:

```typescript
vistaView({
  elements: '#gallery a',
  maxZoomLevel: 3, // Allow 300% zoom (default: 2 = 200%)
});
```

**Note:** VistaView respects the actual image resolution. If an image is 1000px wide and the viewport is 500px, the maximum practical zoom is 2x (100% of actual size).

## Preloading

### preloads

Number of adjacent images to preload:

```typescript
vistaView({
  elements: '#gallery a',
  preloads: 2, // Preload 2 images on each side (default: 1)
});
```

This improves navigation speed but uses more bandwidth. Set to `0` to disable preloading.

## Control Configuration

### Built-in Controls

VistaView includes these built-in controls:

| Control        | Description                               |
| -------------- | ----------------------------------------- |
| `indexDisplay` | Shows current image index (e.g., "1 / 5") |
| `zoomIn`       | Zoom into the image                       |
| `zoomOut`      | Zoom out of the image                     |
| `close`        | Close the lightbox                        |
| `description`  | Shows the image alt text                  |

### Control Placement

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
    bottomRight: [],
    bottomCenter: [],
  },
});
```

### Adding Extension Controls

Extensions can add custom controls:

```typescript
import { download } from 'vistaview/extensions/download';

vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'], // Add 'download'
  },
  extensions: [download()], // Register extension
});
```

## Keyboard & UI Options

### keyboardListeners

Enable/disable keyboard navigation:

```typescript
vistaView({
  elements: '#gallery a',
  keyboardListeners: false, // Disable keyboard controls
});
```

### arrowOnSmallScreens

Show navigation arrows on mobile devices:

```typescript
vistaView({
  elements: '#gallery a',
  arrowOnSmallScreens: true, // Show arrows on screens < 768px
});
```

### initialZIndex

Set the starting z-index for the lightbox:

```typescript
vistaView({
  elements: '#gallery a',
  initialZIndex: 9999, // Ensure lightbox appears above everything
});
```

## Event Callbacks

### onOpen

Called when the lightbox opens:

```typescript
vistaView({
  elements: '#gallery a',
  onOpen: (vistaView) => {
    console.log('Lightbox opened');
    document.body.style.overflow = 'hidden';
  },
});
```

### onClose

Called when the lightbox closes:

```typescript
vistaView({
  elements: '#gallery a',
  onClose: (vistaView) => {
    console.log('Lightbox closed');
    document.body.style.overflow = '';
  },
});
```

### onImageView

Called when viewing an image (including on open):

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data) => {
    console.log('Viewing image:', data.index.to);
    console.log('Previous image:', data.index.from);
  },
});
```

## Data Attributes

VistaView supports these data attributes on HTML elements:

| Attribute               | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `data-vistaview-src`    | Full-size image URL (overrides href/src)        |
| `data-vistaview-srcset` | Responsive image srcset                         |
| `data-vistaview-alt`    | Alt text for lightbox (overrides element's alt) |

Example:

```html
<a href="/fallback.jpg" data-vistaview-src="/images/full.jpg">
  <img
    src="/images/thumb.jpg"
    alt="Thumbnail text"
    data-vistaview-alt="Different text in lightbox"
  />
</a>
```

## Advanced: Custom Functions

For advanced customization, you can override default behavior functions:

```typescript
import { vistaView, transition, close } from 'vistaview';

vistaView({
  elements: '#gallery a',

  // Custom initialization (runs on open)
  initFunction: (vistaView) => {
    console.log('Custom init');
  },

  // Custom setup when navigating
  setupFunction: (data) => {
    console.log('Setting up image:', data.index.to);
  },

  // Custom transition animation
  transitionFunction: async (data, abortSignal) => {
    // Use default transition
    return transition(data, abortSignal);
  },

  // Custom cleanup on close
  closeFunction: (vistaView) => {
    console.log('Custom close');
    close(vistaView); // Call default close
  },
});
```

See the [API Reference](/core/api-reference) for more details on these functions.

## TypeScript Support

All configuration options are fully typed:

```typescript
import type { VistaParamsNeo, VistaOpt } from 'vistaview';

const config: VistaParamsNeo = {
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
};
```

## Next Steps

- Learn about [events and lifecycle](/core/events)
- Explore [keyboard shortcuts and gestures](/core/keyboard-gestures)
- Discover [extensions](/extensions/overview)
