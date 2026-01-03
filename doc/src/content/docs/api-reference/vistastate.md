---
title: VistaState Class
description: Internal state management class for VistaView
---

The `VistaState` class manages the internal state of a [VistaView](/api-reference/vistaview) instance. It tracks the current state of the lightbox, including open/close status, current image, zoom level, and registered extensions.

## Overview

`VistaState` is automatically instantiated by [VistaView](/api-reference/vistaview) and accessible via the [`state`](/api-reference/vistaview#state) property. It provides a centralized location for all runtime state information.

**Access:**

```typescript
const viewer = new VistaView('.gallery-item');
viewer.open();

console.log(viewer.state.currentIndex); // Current image index
console.log(viewer.state.zoomedIn); // Zoom state
console.log(viewer.state.elmLength); // Total images
```

## Properties

### open

```typescript
open: boolean;
```

Whether the lightbox is currently open. `true` when the lightbox is visible, `false` when closed.

### settled

```typescript
settled: boolean;
```

Whether the open transition animation has completed. Useful for determining if the lightbox is fully settled after opening.

### closing

```typescript
closing: boolean;
```

Whether the lightbox is currently in the process of closing. `true` during the close transition animation.

### zoomedIn

```typescript
zoomedIn: boolean;
```

Whether the current image is zoomed beyond its minimum scale. `false` when the image is at fit-to-viewport scale, `true` when zoomed in.

### children

```typescript
children: {
  htmls: HTMLElement[];
  images: VistaBox[];
}
```

Current DOM elements and image instances in the view.

**Properties:**

- `htmls` - Array of HTML container elements (`.vvw-item` divs)
- `images` - Array of [VistaBox](#vistabox) instances (images or custom content)

The arrays include the current image plus preloaded images based on the `preloads` configuration option.

**Example:**

```typescript
const viewer = new VistaView('.gallery-item', { preloads: 2 });
viewer.open(5);

// With preloads: 2, children includes images at indices 3, 4, 5, 6, 7
console.log(viewer.state.children.images.length); // 5
console.log(viewer.state.children.images[2].index); // 5 (center image)
```

### currentIndex

```typescript
currentIndex: number;
```

Zero-based index of the currently displayed image. `-1` when the lightbox is closed.

**Example:**

```typescript
console.log(viewer.state.currentIndex); // 3 (viewing 4th image)
```

### elmLength

```typescript
elmLength: number;
```

Total number of images in the gallery. Updated automatically when `reset()` is called.

**Example:**

```typescript
const viewer = new VistaView('.gallery-item');
console.log(viewer.state.elmLength); // 10 (total images)
```

### abortController

```typescript
abortController: AbortController;
```

Controller for canceling in-progress transitions. Automatically reset before each navigation to abort the previous transition.

**Use Case:** Extensions can listen to the abort signal to cancel long-running operations when the user navigates quickly.

**Example:**

```typescript
const signal = viewer.state.abortController.signal;

signal.addEventListener('abort', () => {
  console.log('Transition was canceled');
});
```

### isReducedMotion

```typescript
isReducedMotion: boolean;
```

Whether the user has requested reduced motion via system preferences. Detected from the `prefers-reduced-motion` media query.

**Example:**

```typescript
if (viewer.state.isReducedMotion) {
  console.log('User prefers reduced motion');
}
```

### extensions

```typescript
extensions: Set<VistaExtension>;
```

Set of registered [extension](/api-reference/extensions) instances. Populated from the `extensions` configuration option.

**Example:**

```typescript
import { logger } from 'vistaview/extensions/logger';

const viewer = new VistaView('.gallery-item', {
  extensions: [logger()],
});

console.log(viewer.state.extensions.size); // 1
```

## Related

- [VistaView Class](/api-reference/vistaview) - Main controller class that uses VistaState
- [VistaExtension](/api-reference/types#vistaextension) - Extension interface type
- [Extensions](/api-reference/extensions) - Extension system documentation
