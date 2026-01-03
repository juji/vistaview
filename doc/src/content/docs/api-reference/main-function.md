---
title: Main Function
description: vistaView() function, configuration, and instance methods
---

## vistaView()

Creates and initializes a VistaView lightbox instance.

```typescript
function vistaView(params: VistaParamsNeo): VistaInterface;
```

**Parameters:**

- `params: VistaParamsNeo` - Configuration object

**Returns:** `VistaInterface` - The lightbox instance with control methods

**Example:**

```typescript
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

const gallery = vistaView({
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
});
```

## Configuration Types

### VistaParamsNeo

Main configuration interface including the `elements` property.

```typescript
interface VistaParamsNeo extends VistaOpt {
  elements: string | VistaImgConfig[];
}
```

**Properties:**

- `elements` (required): CSS selector string or array of image configurations

**Example with selector:**

```typescript
vistaView({
  elements: '#gallery a',
});
```

**Example with array:**

```typescript
vistaView({
  elements: [
    { src: '/images/photo1.jpg', alt: 'Photo 1' },
    { src: '/images/photo2.jpg', alt: 'Photo 2' },
  ],
});
```

### VistaOpt

Base configuration options (without `elements`). See [Complete Configuration](/core/configuration/complete) for all options.

```typescript
interface VistaOpt {
  // Animation
  animationDurationBase?: number;

  // Zoom
  maxZoomLevel?: number;

  // Preloading
  preloads?: number;

  // Interaction
  keyboardListeners?: boolean;
  arrowOnSmallScreens?: boolean;
  rapidLimit?: number;

  // Styling
  initialZIndex?: number;

  // Controls
  controls?: Partial<Record<ControlPosition, (VistaDefaultCtrl | string)[]>>;

  // Extensions
  extensions?: VistaExtension[];

  // Event Callbacks
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
  onImageView?: (data: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;

  // Lifecycle Functions
  initFunction?: VistaInitFn;
  imageSetupFunction?: VistaImageSetupFn;
  transitionFunction?: VistaTransitionFn;
  closeFunction?: VistaCloseFn;
}
```

### VistaImgConfig

Image configuration object for array-based initialization.

```typescript
interface VistaImgConfig {
  src: string;
  alt?: string;
  srcSet?: string;
}
```

**Properties:**

- `src` (required): Image URL
- `alt` (optional): Alt text for accessibility
- `srcSet` (optional): Responsive image sources

**Example:**

```typescript
const images: VistaImgConfig[] = [
  {
    src: '/images/photo1.jpg',
    alt: 'Beach sunset',
    srcSet: '/images/photo1-1x.jpg 1x, /images/photo1-2x.jpg 2x',
  },
  {
    src: '/images/photo2.jpg',
    alt: 'Mountain view',
  },
];

vistaView({ elements: images });
```

## VistaInterface

The return type of `vistaView()` - provides methods to control the lightbox.

```typescript
interface VistaInterface {
  open(index?: number): void;
  close(): void;
  view(index: number): void;
  next(): void;
  prev(): void;
  getCurrentIndex(): number;
  destroy(): void;
}
```

## Instance Methods

### open(index?)

Opens the lightbox at the specified index (0-based).

```typescript
open(index?: number): void;
```

**Parameters:**

- `index` (optional): Image index to open at (default: 0)

**Example:**

```typescript
const gallery = vistaView({ elements: '#gallery a' });

gallery.open(); // Open at first image
gallery.open(0); // Open at first image
gallery.open(2); // Open at third image
```

### close()

Closes the lightbox.

```typescript
close(): void;
```

**Example:**

```typescript
gallery.close();
```

### view(index)

Navigates to a specific image while the lightbox is open.

```typescript
view(index: number): void;
```

**Parameters:**

- `index` (required): Image index to navigate to (0-based)

**Example:**

```typescript
gallery.view(2); // Go to third image
```

### next()

Navigates to the next image. Wraps to first image when at the end.

```typescript
next(): void;
```

**Example:**

```typescript
gallery.next();
```

### prev()

Navigates to the previous image. Wraps to last image when at the beginning.

```typescript
prev(): void;
```

**Example:**

```typescript
gallery.prev();
```

### getCurrentIndex()

Returns the current image index (0-based).

```typescript
getCurrentIndex(): number;
```

**Returns:** Current image index

**Example:**

```typescript
const currentIndex = gallery.getCurrentIndex();
console.log(`Viewing image ${currentIndex + 1}`);
```

### destroy()

Destroys the lightbox instance and removes all event listeners.

```typescript
destroy(): void;
```

**Example:**

```typescript
gallery.destroy();
```

## Complete Example

```typescript
import { vistaView } from 'vistaview';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';

const gallery: VistaInterface = vistaView({
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
  keyboardListeners: true,
  onOpen: () => console.log('Gallery opened'),
  onClose: () => console.log('Gallery closed'),
});

// Control programmatically
document.querySelector('#open-btn')?.addEventListener('click', () => {
  gallery.open(0);
});

document.querySelector('#next-btn')?.addEventListener('click', () => {
  gallery.next();
});

document.querySelector('#prev-btn')?.addEventListener('click', () => {
  gallery.prev();
});

document.querySelector('#close-btn')?.addEventListener('click', () => {
  gallery.close();
});

// Get current position
console.log('Current index:', gallery.getCurrentIndex());

// Cleanup when done
// gallery.destroy();
```

## Related

- [Event Callbacks](/api-reference/events)
- [Lifecycle Functions](/api-reference/lifecycle)
- [Complete Configuration Guide](/core/configuration/complete)
