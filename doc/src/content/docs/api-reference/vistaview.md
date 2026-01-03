---
title: VistaView Class
description: The core VistaView class - the main controller for the lightbox viewer
---

The `VistaView` class is the core controller that manages the entire lifecycle of the lightbox viewer. Each instance represents a lightbox that can be opened, navigated, and controlled programmatically.

## Overview

`VistaView` orchestrates all aspects of the lightbox experience:

- **Instance Management**: Ensures only one lightbox is active at a time via `GlobalVistaState`
- **Image Navigation**: Handles next/prev navigation with smooth transitions and rapid-swap optimization
- **UI Controls**: Manages zoom, close, and navigation buttons
- **Event Coordination**: Integrates pointer events, keyboard shortcuts, and extension hooks
- **State Management**: Tracks current index, zoom level, and UI activation state
- **Extension Integration**: Calls extension lifecycle hooks at key moments

## Constructor

```typescript
new VistaView(elements: string | VistaImgConfig[], options?: VistaOpt)
```

Creates a new VistaView instance.

**Parameters:**

- `elements`: Either a CSS selector string or an array of image configurations
- `options`: Optional configuration object (see [VistaOpt](/api-reference/types#vistaopt))

**Example:**

```typescript
// Using CSS selector
const viewer = new VistaView('.gallery-item', {
  maxZoomLevel: 3,
  preloads: 2,
});

// Using configuration array
const viewer = new VistaView([
  { src: 'image1.jpg', alt: 'First image' },
  { src: 'image2.jpg', alt: 'Second image' },
]);
```

## Public Properties

### options

```typescript
options: VistaOpt;
```

The merged configuration options for this instance. Combines user-provided options with [DefaultOptions](/api-reference/lifecycle#defaultoptions).

### state

```typescript
state: VistaState;
```

The current state manager containing:

- `currentIndex`: Current image index
- `elmLength`: Total number of images
- `zoomedIn`: Whether the current image is zoomed
- `extensions`: Set of registered extensions
- `children`: Current DOM elements and VistaBox instances
- `abortController`: For canceling transitions

### imageContainer

```typescript
imageContainer: HTMLElement | null;
```

Reference to the DOM element containing the image elements. `null` when the lightbox is closed.

### externalPointerListener

```typescript
externalPointerListener: ((e: VistaExternalPointerListenerArgs) => void)[]
```

Array of external pointer event listeners registered via `registerPointerListener()`. Used by extensions to hook into pointer events.

## Public Methods

### open()

```typescript
open(startIndex?: number): void
```

Opens the lightbox at the specified image index.

**Parameters:**

- `startIndex`: The index of the image to display first (default: `0`)

**Behavior:**

- Prevents opening if another VistaView instance is already open
- Prevents body scrolling
- Creates and injects the lightbox DOM structure
- Sets up event handlers and keyboard listeners
- Calls `onOpen` event callback and extension hooks
- Supports negative indices and values beyond the array length (wraps around)

**Example:**

```typescript
const viewer = new VistaView('.gallery-item');
viewer.open(2); // Opens at the third image
```

### close()

```typescript
close(animate?: boolean): Promise<void>
```

Closes the lightbox and cleans up resources.

**Parameters:**

- `animate`: Whether to animate the close transition (default: `true`)

**Behavior:**

- Waits for close animation to complete (if `animate` is `true`)
- Removes DOM elements and event handlers
- Destroys all VistaBox instances
- Restores body scrolling
- Calls `onClose` event callback and extension hooks
- Resets `GlobalVistaState`

**Example:**

```typescript
// Close with animation
await viewer.close();

// Close immediately without animation
await viewer.close(false);
```

### destroy()

```typescript
destroy(): void
```

Completely destroys the VistaView instance and removes all event listeners.

**Behavior:**

- Closes the lightbox without animation
- Removes click listeners from trigger elements
- Clears external pointer listeners
- Cannot be reopened after destruction

**Example:**

```typescript
viewer.destroy();
// viewer is now unusable
```

### next()

```typescript
next(): void
```

Navigates to the next image in the sequence.

**Behavior:**

- Wraps around to the first image after the last one
- Triggers transition animation
- Calls `onImageView` event callback

**Example:**

```typescript
viewer.next();
```

### prev()

```typescript
prev(): void
```

Navigates to the previous image in the sequence.

**Behavior:**

- Wraps around to the last image when at the first one
- Triggers transition animation
- Calls `onImageView` event callback

**Example:**

```typescript
viewer.prev();
```

### view()

```typescript
view(index: number, via?: { next: boolean; prev: boolean }): void
```

Jumps to a specific image by index.

**Parameters:**

- `index`: The target image index
- `via`: Optional object indicating navigation direction (used internally)

**Behavior:**

- Supports negative indices and values beyond array length (wraps around)
- Aborts any in-progress transition
- Calls `onImageView` event callback
- Handles rapid navigation with optimized transitions

**Example:**

```typescript
viewer.view(5); // Jump to 6th image
viewer.view(-1); // Jump to last image
```

### zoomIn()

```typescript
zoomIn(): void
```

Zooms in on the current image by a factor of 1.68x.

**Behavior:**

- Respects `maxZoomLevel` option
- Throttled to prevent excessive calls (222ms)
- Disables zoom-in button when at maximum zoom
- Can be disabled via `deactivateUi(['zoomIn'])`

**Example:**

```typescript
viewer.zoomIn();
```

### zoomOut()

```typescript
zoomOut(): void
```

Zooms out of the current image by a factor of 0.68x.

**Behavior:**

- Returns to minimum zoom (fit to viewport)
- Throttled to prevent excessive calls (222ms)
- Disables zoom-out button when at minimum zoom
- Can be disabled via `deactivateUi(['zoomOut'])`

**Example:**

```typescript
viewer.zoomOut();
```

### getCurrentIndex()

```typescript
getCurrentIndex(): number
```

Returns the current image index.

**Returns:** The zero-based index of the currently displayed image, or `-1` if closed.

**Example:**

```typescript
const index = viewer.getCurrentIndex();
console.log(`Viewing image ${index + 1}`);
```

### reset()

```typescript
reset(): void
```

Recalculates the image list and reattaches click listeners.

**Behavior:**

- Queries the DOM for elements matching the selector (if using string selector)
- Updates `state.elmLength`
- Removes and re-adds click event listeners

**Use Case:** Call this if the DOM has changed (elements added/removed) and you need to update the gallery.

**Example:**

```typescript
// After dynamically adding more images to the page
document.querySelector('.gallery').innerHTML += '<a href="new.jpg" class="gallery-item">New</a>';
viewer.reset();
```

### qs()

```typescript
qs<T extends HTMLElement>(selector: string): T | null
```

Queries for an element within the lightbox root element.

**Parameters:**

- `selector`: CSS selector string

**Returns:** The first matching element or `null`

**Example:**

```typescript
const closeButton = viewer.qs<HTMLButtonElement>('.vvw-close');
```

### qsOrigin()

```typescript
qsOrigin<T extends NodeListOf<HTMLElement>>(selector: string): T
```

Queries for elements in the document (not limited to lightbox root).

**Parameters:**

- `selector`: CSS selector string

**Returns:** NodeList of matching elements

**Example:**

```typescript
const galleryItems = viewer.qsOrigin<NodeListOf<HTMLAnchorElement>>('.gallery-item');
```

### registerPointerListener()

```typescript
registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void
```

Registers an external pointer event listener.

**Parameters:**

- `listener`: Function that receives pointer event data

**Use Case:** Extensions can use this to respond to pointer events without directly managing event handlers.

**Example:**

```typescript
viewer.registerPointerListener((e) => {
  console.log('Pointer event:', e.type, e.pointer);
});
```

### deactivateUi()

```typescript
deactivateUi(names: string[], requestBy?: VistaBox): void
```

Temporarily disables UI controls.

**Parameters:**

- `names`: Array of control names to disable (e.g., `['zoomIn', 'zoomOut']`)
- `requestBy`: Optional VistaBox instance making the request

**Behavior:**

- Sets `disabled` attribute on specified buttons
- Notifies extensions via `onDeactivateUi` hook
- Automatically reactivated before navigation or transitions

**Example:**

```typescript
// Disable zoom during a custom animation
viewer.deactivateUi(['zoomIn', 'zoomOut']);
```

## Global State

### GlobalVistaState

```typescript
export const GlobalVistaState: { somethingOpened: VistaView | null };
```

Singleton object tracking the currently open VistaView instance. Ensures only one lightbox is active at a time.

**Example:**

```typescript
import { GlobalVistaState } from 'vistaview';

if (GlobalVistaState.somethingOpened) {
  console.log('A lightbox is currently open');
}
```

## Related

- [Main Function](/api-reference/main-function) - The `vistaView()` function that creates [VistaView](/api-reference/vistaview) instances
- [VistaOpt](/api-reference/types#vistaopt) - Configuration options type
- [Event Callbacks](/api-reference/events) - Events fired during lifecycle
- [Lifecycle Functions](/api-reference/lifecycle) - Customizable lifecycle hooks

:::tip
Use the [`vistaView()`](/api-reference/main-function) function (lowercase 'v') for creating instances. The `VistaView` class (capital 'V') is primarily used for TypeScript type imports in extensions and callbacks.
:::
