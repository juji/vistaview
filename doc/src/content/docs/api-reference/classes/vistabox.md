---
title: VistaBox Class
description: Base class for image and custom content containers
---

The `VistaBox` class is an abstract base class for all content types in VistaView. Extend this class to create custom content types like videos, maps, or interactive elements.

## Overview

`VistaBox` handles:

- Image sizing and scaling
- Zoom and pan transformations
- Lifecycle management (init, load, destroy)
- State management for width, height, and transformations

**Use Case:** Create custom content extensions by extending VistaBox. See [Extensions](/api-reference/extensions) for examples.

## Public Properties

### element

```typescript
abstract element: HTMLImageElement | HTMLDivElement
```

The DOM element containing the content. Must be implemented by subclasses.

### state

```typescript
state: VistaImageState;
```

Current state of the image including dimensions and transformations. Contains internal properties prefixed with `_` (e.g., `_width`, `_height`, `_transform`).

### pos

```typescript
pos: number;
```

Position relative to the current image (`0` = center, `-1` = left, `1` = right).

### index

```typescript
index: number;
```

Zero-based index in the gallery.

### config

```typescript
config: VistaImgConfig;
```

Image configuration containing `src`, `alt`, and `srcSet`.

### origin

```typescript
origin: VistaImgOrigin | undefined;
```

Information about the origin element (thumbnail) in the DOM.

### isReady

```typescript
isReady: boolean;
```

Whether the content has finished loading.

### thumb

```typescript
thumb: HTMLDivElement | null;
```

Thumbnail element used during transitions.

## Public Methods

### constructor()

```typescript
constructor(par: VistaImageParams)
```

Creates a new VistaBox instance. Called by [VistaView](/api-reference/classes/vistaview) during initialization.

### init()

```typescript
async init(): Promise<void>
```

Initializes the content. Override this to implement custom loading logic.

### setSizes()

```typescript
setSizes(par?: { stableSize?: boolean; initDimension?: boolean }): void
```

Calculates and sets dimensions based on viewport and content size.

**Parameters:**

- `par.stableSize` - Use cached dimensions without recalculation
- `par.initDimension` - Calculate initial dimensions from origin element

### prepareClose()

```typescript
prepareClose(): void
```

Prepares the element for closing transition. Called before the lightbox closes.

### cancelPendingLoad()

```typescript
cancelPendingLoad(): void
```

Cancels any in-progress image loading operations.

### destroy()

```typescript
destroy(): void
```

Cleans up resources and removes event listeners. Called when the element is no longer needed.

### cloneStyleFrom()

```typescript
cloneStyleFrom(img: VistaBox, state?: VistaHiresTransitionOpt): void
```

Copies style and state from another VistaBox instance. Used during transitions to maintain visual continuity.

### toObject()

```typescript
toObject(): VistaImageClone
```

Returns a serializable representation of the current state. Used for the `onContentChange` event.

### setInitialCenter()

```typescript
setInitialCenter(center: { x: number; y: number }): void
```

Sets the center point for zoom and pan operations.

### onImageReady()

```typescript
onImageReady(): void
```

Override this method to perform actions when the content is ready.

### animateZoom()

```typescript
animateZoom(scaleFactor: number, center?: { x: number; y: number }): void
```

Override to implement custom zoom animation logic.

### scaleMove()

```typescript
scaleMove(scaleFactor: number, center?: { x: number; y: number }, animate?: boolean): void
```

Override to implement custom scale and movement logic.

### momentumThrow()

```typescript
momentumThrow(par: { x: number; y: number }): () => void
```

Override to implement momentum scrolling after a swipe gesture.

## Related

- [VistaImage](#vistaimage-class) - Image implementation extending VistaBox
- [Extensions](/api-reference/extensions) - Creating custom content types
- [VistaImageParams](/api-reference/types#vistaimageparams) - Constructor parameters
