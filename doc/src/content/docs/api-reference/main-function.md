---
title: Main Function
description: vistaView() function, configuration, and instance methods
---

## vistaView()

Creates and initializes a lightbox instance. This function is the primary entry point that instantiates the [VistaView](/api-reference/classes/vistaview) class.

```typescript
function vistaView(params: VistaParams): VistaInterface;
```

**Parameters:**

- `params:` [VistaParams](/api-reference/types#VistaParams) - Configuration object

**Returns:** [VistaInterface](/api-reference/types#vistainterface) - The lightbox instance with control methods

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

:::note
The `vistaView()` function (lowercase 'v') is the factory function, while [VistaView](/api-reference/classes/vistaview) (capital 'V') is the underlying class. For most use cases, use the `vistaView()` function. Direct access to the VistaView class is useful for TypeScript type imports and advanced extensions.
:::

**Configuration:** See [Types](/api-reference/types) for:

- [VistaParams](/api-reference/types#VistaParams) - Main configuration interface
- [VistaOpt](/api-reference/types#vistaopt) - All configuration options
- [VistaImgConfig](/api-reference/types#vistaimgconfig) - Image configuration object

## Instance Methods

The `vistaView()` function returns a [VistaInterface](/api-reference/types#vistainterface) object with the following methods:

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
close(): Promise<void>;
```

**Returns:** Promise that resolves when close animation completes

**Example:**

```typescript
await gallery.close();
console.log('Gallery closed');
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

### reset()

Recalculates elements and re-attaches event listeners. Useful after DOM changes.

```typescript
reset(): void;
```

**Example:**

```typescript
// After adding new images to the DOM
document.querySelector('#gallery')!.innerHTML += `
  <a href="/images/new-photo.jpg">
    <img src="/thumbnails/new-photo.jpg" alt="New Photo" />
  </a>
`;

// Refresh the gallery
gallery.reset();
```

### zoomIn()

Zooms in on the current image.

```typescript
zoomIn(): void;
```

**Example:**

```typescript
gallery.zoomIn();
```

### zoomOut()

Zooms out on the current image.

```typescript
zoomOut(): void;
```

**Example:**

```typescript
gallery.zoomOut();
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

## Related

- [Event Callbacks](/api-reference/events)
- [Lifecycle Functions](/api-reference/lifecycle)
- [Complete Configuration Guide](/core/configuration/complete)
