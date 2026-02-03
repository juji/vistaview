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

## Protected Properties

The following protected properties are available when extending VistaBox:

### initH

```typescript
protected initH: number = 0
```

Initial height of the content based on thumbnail dimensions.

### initW

```typescript
protected initW: number = 0
```

Initial width of the content based on thumbnail dimensions.

### fullH

```typescript
protected fullH: number = 0
```

Full height of the content when displayed in the lightbox.

### fullW

```typescript
protected fullW: number = 0
```

Full width of the content when displayed in the lightbox.

### maxW

```typescript
protected maxW: number = 0
```

Maximum allowed width for the content.

### minW

```typescript
protected minW: number = 0
```

Minimum allowed width for the content.

### defaultWH

```typescript
protected defaultWH: number = 200
```

Default width/height fallback value.

### isZoomedIn

```typescript
protected isZoomedIn: boolean = false
```

Whether the content is currently zoomed in.

### isCancelled

```typescript
protected isCancelled: boolean = false
```

Whether the loading operation has been cancelled.

### isLoadedResolved

```typescript
protected isLoadedResolved: ((val: boolean | PromiseLike<boolean>) => void) | null = null
```

Resolver function for the `isLoaded` promise.

### isLoadedRejected

```typescript
protected isLoadedRejected: ((reason?: any) => void) | null = null
```

Rejection function for the `isLoaded` promise.

### isLoaded

```typescript
protected isLoaded: Promise<boolean>
```

Promise that resolves when the content has finished loading.

### replacement

```typescript
protected replacement: HTMLImageElement | null = null
```

Placeholder element that replaces the original thumbnail in the DOM.

### originalParent

```typescript
protected originalParent: HTMLElement | null = null
```

Reference to the original parent element of the thumbnail.

### originalNextSibling

```typescript
protected originalNextSibling: ChildNode | null = null
```

Reference to the next sibling of the original thumbnail for proper reinsertion.

### originalStyle

```typescript
protected originalStyle = ''
```

Original CSS text of the thumbnail element.

### thumbImage

```typescript
protected thumbImage: HTMLImageElement | null = null
```

Reference to the original thumbnail image element.

### originRect

```typescript
protected originRect: { width: number; height: number; top: number; left: number }
```

Bounding rectangle of the origin element.

### fittedSize

```typescript
protected fittedSize: { width: number; height: number } | null = null
```

Calculated fitted size of the thumbnail image.

### maxZoomLevel

```typescript
protected maxZoomLevel: number
```

Maximum zoom level allowed for this content.

### vistaView

```typescript
protected vistaView: VistaView
```

Reference to the parent VistaView instance.

### transitionState

```typescript
protected transitionState: VistaHiresTransitionOpt | null = null
```

State object for high-resolution transitions.

### transitionShouldWait

```typescript
protected transitionShouldWait: () => boolean = () => false
```

Function that determines if transition should wait before starting.

### initPointerCenter

```typescript
protected initPointerCenter = { x: 0, y: 0 }
```

Initial center point for pointer interactions.

### onScale

```typescript
protected onScale: (par: {
  vistaImage: VistaBox;
  scale: number;
  isMax: boolean;
  isMin: boolean;
}) => void
```

Callback function invoked when content is scaled.

## Protected Methods

The following protected methods are available when extending VistaBox:

### createState()

```typescript
protected createState(): VistaImageState
```

Creates and returns a new state object with getters/setters that trigger DOM updates. Called in the constructor.

### onLessThanMinWidthChange()

```typescript
protected onLessThanMinWidthChange(value: boolean): void
```

Called when content width falls below minimum. Sets opacity to 0.5 when true.

### onTranslateChange()

```typescript
protected onTranslateChange(value: { x: number; y: number }): void
```

Updates the CSS translate property when state.translate changes.

### onTransformChange()

```typescript
protected onTransformChange(value: { x: number; y: number; scale: number }): void
```

Updates the CSS transform property when state.transform changes.

### onWidthChange()

```typescript
protected onWidthChange(value: number): void
```

Updates the CSS width property when state.width changes.

### onHeightChange()

```typescript
protected onHeightChange(value: number): void
```

Updates the CSS height property when state.height changes.

### getFullSizeDim()

```typescript
protected getFullSizeDim(): { width: number; height: number }
```

Calculates the full size dimensions based on thumbnail aspect ratio and viewport size.

**Returns:** Object containing calculated width and height.

### normalize()

```typescript
protected normalize(): void
```

Resets content to its default state with no zoom or translation. Sets transform and translate to zero, and dimensions to full size.

### getFromParsedSrcSet()

```typescript
protected getFromParsedSrcSet(targetWidth: number): string | null
```

Selects the most appropriate source from the parsed srcSet based on target width and device pixel ratio.

**Parameters:**

- `targetWidth` - The desired width in pixels

**Returns:** The selected source URL, or null if no srcSet is available.

### setFinalTransform()

```typescript
setFinalTransform(par?: { propagateEvent?: boolean }): { close: boolean; cancel: () => void }
```

Finalizes the current transform state by converting temporary transforms into permanent translate and size values. Called at the end of pan/zoom operations.

**Parameters:**

- `par.propagateEvent` - Whether to trigger onContentChange events (default: true)

**Returns:** Object with close flag and cancel function.

## Related

- [VistaImage](/api-reference/classes/vistaimage) - Image implementation extending VistaBox
- [Extensions](/api-reference/extensions) - Creating custom content types
- [VistaImageParams](/api-reference/types#vistaimageparams) - Constructor parameters
