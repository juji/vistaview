---
title: Types
description: TypeScript type definitions and interfaces
---

Complete TypeScript type definitions for VistaView.

## Core Types

### VistaParamsNeo

Main configuration interface including the `elements` property.

```typescript
interface VistaParamsNeo extends VistaOpt {
  elements: string | VistaImgConfig[];
}
```

**Properties:**

- `elements` (required): CSS selector string or array of [VistaImgConfig](#vistaimgconfig) configurations
- Extends [VistaOpt](#vistaopt) with all configuration options

### VistaOpt

Base configuration options interface.

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
  controls?: {
    topLeft?: (VistaDefaultCtrl | string)[];
    topRight?: (VistaDefaultCtrl | string)[];
    topCenter?: (VistaDefaultCtrl | string)[];
    bottomCenter?: (VistaDefaultCtrl | string)[];
    bottomLeft?: (VistaDefaultCtrl | string)[];
    bottomRight?: (VistaDefaultCtrl | string)[];
  };

  // Extensions
  extensions?: VistaExtension[];

  // Event Callbacks
  onOpen?: (vistaView:` [VistaView](/api-reference/vistaview)) => void;
  onClose?: (vistaView:` [VistaView](/api-reference/vistaview)) => void;
  onImageView?: (data:` [VistaData](#vistadata), vistaView: [VistaView](/api-reference/vistaview)) => void;
  onContentChange?: (content:` [VistaImageClone](#vistaimageclone), vistaView: [VistaView](/api-reference/vistaview)) => void;

  // Lifecycle Functions
  initFunction?: VistaInitFn;
  imageSetupFunction?: VistaImageSetupFn;
  transitionFunction?: VistaTransitionFn;
  openFunction?: VistaOpenFn;
  closeFunction?: VistaCloseFn;
}
```

**Related Types:**

- [VistaDefaultCtrl](#vistadefaultctrl) - Control names
- [VistaExtension](#vistaextension) - Extension system
- [VistaData](#vistadata), [VistaImageClone](#vistaimageclone) - Event data
- [VistaInitFn](#vistainitfn), [VistaImageSetupFn](#vistaimagesetupfn), [VistaTransitionFn](#vistatransitionfn), [VistaOpenFn](#vistaopenfn), [VistaCloseFn](#vistaclosefn) - Lifecycle functions

### VistaInterface

Instance interface with control methods returned by `vistaView()`.

```typescript
interface VistaInterface {
  open(index?: number): void;
  close(): Promise<void>;
  view(index: number): void;
  next(): void;
  prev(): void;
  reset(): void;
  zoomIn(): void;
  zoomOut(): void;
  getCurrentIndex(): number;
  destroy(): void;
}
```

**Methods:**

- `open(index?)` - Opens lightbox at specified index
- `close()` - Closes lightbox (returns Promise)
- `view(index)` - Navigate to specific image
- `next()` - Navigate to next image
- `prev()` - Navigate to previous image
- `reset()` - Reset zoom and position
- `zoomIn()` - Zoom in
- `zoomOut()` - Zoom out
- `getCurrentIndex()` - Get current image index
- `destroy()` - Destroy instance and cleanup

### VistaImgConfig

Image configuration object.

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

## Event Data Types

### VistaData

Data passed to event callbacks and transition functions.

```typescript
interface VistaData {
  htmlElements: {
    from: HTMLElement[] | null;
    to: HTMLElement[] | null;
  };
  images: {
    from: VistaBox[] | null;
    to: VistaBox[] | null;
  };
  index: {
    from: number | null;
    to: number | null;
  };
  via: {
    next: boolean;
    prev: boolean;
  };
}
```

**Properties:**

- `htmlElements.from` - Previous HTML elements
- `htmlElements.to` - New HTML elements
- `images.from` - Previous image objects
- `images.to` - New image objects
- `index.from` - Previous image index (null on initial open)
- `index.to` - New image index
- `via.next` - True if navigated via next
- `via.prev` - True if navigated via previous

### VistaImageClone

Current image state passed to `onContentChange` callback.

```typescript
interface VistaImageClone {
  config: {
    src: string;
    alt?: string;
    srcSet?: string;
  };
  origin: {
    src: string;
    srcSet: string;
    borderRadius: string;
    objectFit: string;
  } | null;
  parsedSrcSet?: { src: string; width: number }[];
  element: string;
  thumb?: string;
  index: number;
  pos: number;
  state: {
    width: number;
    height: number;
    transform: {
      x: number;
      y: number;
      scale: number;
    };
    translate: {
      x: number;
      y: number;
    };
  };
}
```

**Properties:**

- `config` - Image configuration (src, alt, srcSet)
- `origin` - Original element properties (null for non-image content)
- `parsedSrcSet` - Parsed srcSet attribute
- `element` - HTML string of the content
- `thumb` - Thumbnail URL (if applicable)
- `index` - Current image index
- `pos` - Position in the view
- `state.width` - Current width
- `state.height` - Current height
- `state.transform` - Transform state (x, y, scale)
- `state.translate` - Translation offsets (x, y)

### VistaParsedElm

Parsed element information passed to extensions.

```typescript
interface VistaParsedElm {
  config: VistaImgConfig;
  parsedSrcSet?: { src: string; width: number }[];
  origin?: VistaImgOrigin;
}
```

**Properties:**

- `config` - Image configuration ([VistaImgConfig](#vistaimgconfig))
- `parsedSrcSet` - Parsed srcSet attribute with sources and widths
- `origin` - Origin element properties ([VistaImgOrigin](#vistaimgorigin))

### VistaImgOrigin

Origin element properties for animations.

```typescript
interface VistaImgOrigin {
  anchor?: HTMLAnchorElement;
  image: HTMLImageElement;
  src: string;
  srcSet: string;
  borderRadius: string;
  objectFit: string;
}
```

**Properties:**

- `anchor` - The original anchor element (if exists)
- `image` - The original image element
- `src` - Original image source
- `srcSet` - Original srcSet attribute
- `borderRadius` - Original border radius style
- `objectFit` - Original object-fit style

## Lifecycle Function Types

### VistaInitFn

Type for custom initialization function.

```typescript
type VistaInitFn = (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

### VistaImageSetupFn

Type for custom setup function when navigating between images.

```typescript
type VistaImageSetupFn = (data: VistaData, vistaView: VistaView) => void;
```

**Parameters:**

- `data:` [VistaData](#vistadata) - Navigation data
- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

### VistaTransitionFn

Type for custom transition animation function.

```typescript
type VistaTransitionFn = (
  data: VistaData,
  abortSignal: AbortSignal,
  vistaView: VistaView
) => { cleanup: () => void; transitionEnded: Promise<void> } | void;
```

**Parameters:**

- `data:` [VistaData](#vistadata) - Navigation data
- `abortSignal: AbortSignal` - Signal to abort the transition
- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

**Returns:** Object with cleanup function and promise, or void

### VistaOpenFn

Type for custom open function.

```typescript
type VistaOpenFn = (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

### VistaCloseFn

Type for custom close function.

```typescript
type VistaCloseFn = (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

## Extension Types

### VistaExtension

Interface for creating extensions.

```typescript
interface VistaExtension {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (parsed: VistaImageParams) => VistaBox | void | null | undefined;
  onImageView?: (data:` [VistaData](#vistadata), vistaView: [VistaView](/api-reference/vistaview)) => void;
  onContentChange?: (content:` [VistaImageClone](#vistaimageclone), vistaView: [VistaView](/api-reference/vistaview)) => void;
  onDeactivateUi?: (names: string[], requestBy:` [VistaBox](#vistabox) | null, vistaView: [VistaView](/api-reference/vistaview)) => void;
  onReactivateUi?: (names: string[], requestBy:` [VistaBox](#vistabox) | null, vistaView: [VistaView](/api-reference/vistaview)) => void;
  onOpen?: (vistaView:` [VistaView](/api-reference/vistaview)) => void;
  onClose?: (vistaView:` [VistaView](/api-reference/vistaview)) => void;
}
```

**Properties:**

- `name` (required) - Unique identifier for the extension
- `description` (optional) - Human-readable description
- `control` (optional) - Returns a custom UI control element
- `onInitializeImage` (optional) - Hook to replace default image creation
- `onImageView` (optional) - Triggered when navigating between images
- `onContentChange` (optional) - Triggered when content changes
- `onDeactivateUi` (optional) - Triggered when UI controls are deactivated
- `onReactivateUi` (optional) - Triggered when UI controls are reactivated
- `onOpen` (optional) - Triggered when lightbox opens
- `onClose` (optional) - Triggered when lightbox closes

**Type References:**

- [VistaImageParams](#vistaimageparams) - Used in `onInitializeImage`
- [VistaData](#vistadata) - Used in `onImageView`
- [VistaImageClone](#vistaimageclone) - Used in `onContentChange`

## Control Types

### VistaDefaultCtrl

Built-in control names.

```typescript
type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';
```

## Advanced Types

### VistaImageParams

Parameters passed to extension `onInitializeImage` hook.

```typescript
interface VistaImageParams {
  elm: VistaParsedElm;
  pos: number;
  index: number;
  maxZoomLevel: number;
  onScale: (par: { vistaImage: VistaBox; scale: number; isMax: boolean; isMin: boolean }) => void;
  vistaView: VistaView;
  transitionState?: VistaHiresTransitionOpt;
  transitionShouldWait?: () => boolean;
}
```

**Properties:**

- `elm` - Parsed element ([VistaParsedElm](#vistaparsedelm))
- `pos` - Position in the view
- `index` - Image index
- `maxZoomLevel` - Maximum zoom level
- `onScale` - Callback for scale changes
- `vistaView` - [VistaView](/api-reference/vistaview) instance
- `transitionState` - Optional transition state
- `transitionShouldWait` - Optional transition wait function

## Pointer Event Types

### VistaPointer

Represents a single pointer (mouse, touch, or pen) position and movement.

```typescript
type VistaPointer = {
  x: number;
  y: number;
  movementX: number;
  movementY: number;
  id: number | string;
};
```

**Properties:**

- `x` - Current X coordinate
- `y` - Current Y coordinate
- `movementX` - Movement delta on X axis since last event
- `movementY` - Movement delta on Y axis since last event
- `id` - Unique identifier for this pointer

### VistaExternalPointerListenerArgs

Arguments passed to external pointer listeners registered via [`registerPointerListener()`](/api-reference/vistaview#registerpointerlistener).

```typescript
type VistaExternalPointerListenerArgs = {
  event: 'down' | 'move' | 'up' | 'cancel';
  pointer: VistaPointer;
  pointers: VistaPointer[];
  lastPointerLen: number;
  state: VistaState;
  hasInternalExecution: boolean;
  abortController: AbortController | null;
};
```

**Properties:**

- `event` - Type of pointer event
- `pointer` - Current [VistaPointer](#vistapointer) data
- `pointers` - Array of all active [VistaPointer](#vistapointer) instances
- `lastPointerLen` - Previous number of pointers (for detecting changes)
- `state` - [VistaState](/api-reference/vistastate) instance
- `hasInternalExecution` - Whether VistaView handled this event internally
- `abortController` - Controller for canceling operations

## Related

- [Main Function](/api-reference/main-function)
- [Event Callbacks](/api-reference/events)
- [Lifecycle Functions](/api-reference/lifecycle)
- [Extensions](/api-reference/extensions)
