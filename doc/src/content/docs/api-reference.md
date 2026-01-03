---
title: API Reference
description: Complete API reference for VistaView
redirect: /api-reference/
---

## Main Function

### vistaView()

Creates and initializes a VistaView lightbox instance.

```typescript
function vistaView(params: VistaParamsNeo): VistaInterface;
```

**Parameters:**

- `params: VistaParamsNeo` - Configuration object (see [Configuration](/core/configuration/complete))

**Returns:** `VistaInterface` - The lightbox instance with control methods

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

### Methods

#### open(index?)

Opens the lightbox at the specified index (0-based).

```typescript
const gallery = vistaView({ elements: '#gallery a' });
gallery.open(0); // Open at first image
gallery.open(); // Open at first image (default)
```

#### close()

Closes the lightbox.

```typescript
gallery.close();
```

#### view(index)

Navigates to a specific image while the lightbox is open.

```typescript
gallery.view(2); // Go to third image (0-based index)
```

#### next()

Navigates to the next image (wraps to first image at the end).

```typescript
gallery.next();
```

#### prev()

Navigates to the previous image (wraps to last image at the beginning).

```typescript
gallery.prev();
```

#### getCurrentIndex()

Returns the current image index (0-based).

```typescript
const currentIndex = gallery.getCurrentIndex();
console.log(`Viewing image ${currentIndex + 1}`);
```

#### destroy()

Destroys the lightbox instance and removes all event listeners.

```typescript
gallery.destroy();
```

## Configuration Types

### VistaParamsNeo

Main configuration interface including the `elements` property.

```typescript
interface VistaParamsNeo extends VistaOpt {
  elements: string | VistaImgConfig[];
}
```

### VistaOpt

Base configuration options (without `elements`).

```typescript
interface VistaOpt {
  animationDurationBase?: number;
  maxZoomLevel?: number;
  preloads?: number;
  keyboardListeners?: boolean;
  arrowOnSmallScreens?: boolean;
  rapidLimit?: number;
  initialZIndex?: number;
  controls?: Partial<Record<ControlPosition, (VistaDefaultCtrl | string)[]>>;
  extensions?: VistaExtension[];
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
  onImageView?: (data: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
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

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data, vistaView) => {
    console.log('From:', data.index.from, 'To:', data.index.to);
    console.log('Via next:', data.via.next, 'Via prev:', data.via.prev);
  },
});
```

### VistaParsedElm

Parsed element information passed to extensions.

```typescript
interface VistaParsedElm {
  config: VistaImgConfig;
  origin: VistaImgOrigin | null;
  index: number;
}
```

### VistaImgOrigin

Origin element properties for animations.

```typescript
interface VistaImgOrigin {
  elm: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
}
```

## Custom Function Types

### VistaInitFn

Type for custom initialization function.

```typescript
type VistaInitFn = (vistaView: VistaView) => void;
```

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  initFunction: (vistaView) => {
    console.log('Custom initialization');
  },
});
```

### VistaOpenFn

Type for custom open function.

```typescript
type VistaOpenFn = (vistaView: VistaView) => void;
```

**Example:**

```typescript
import { open } from 'vistaview';

vistaView({
  elements: '#gallery a',
  openFunction: (vistaView) => {
    console.log('Custom open');
    open(vistaView); // Call default open
  },
});
```

### VistaImageSetupFn

Type for custom setup function when navigating.

```typescript
type VistaImageSetupFn = (data: VistaData, vistaView: VistaView) => void;
```

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  imageSetupFunction: (data, vistaView) => {
    console.log('Setting up image:', data.index.to);
    console.log('Total images:', vistaView.state.elmLength);
  },
});
```

### VistaTransitionFn

Type for custom transition animation function.

```typescript
type VistaTransitionFn = (
  data: VistaData,
  abortSignal: AbortSignal,
  vistaView: VistaView
) => { cleanup: () => void; transitionEnded: Promise<void> } | void;
```

**Example:**

```typescript
import { transition } from 'vistaview';

vistaView({
  elements: '#gallery a',
  transitionFunction: (data, abortSignal, vistaView) => {
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },
});
```

### VistaCloseFn

Type for custom close function.

```typescript
type VistaCloseFn = (vistaView: VistaView) => void;
```

**Example:**

```typescript
import { close } from 'vistaview';

vistaView({
  elements: '#gallery a',
  closeFunction: (vistaView) => {
    console.log('Custom close');
    close(vistaView); // Call default close
  },
});
```

## Extension Types

### VistaExtension

Interface for creating extensions.

```typescript
interface VistaExtension {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (parsed: VistaParsedElm) => VistaBox | void | null | undefined;
  onImageView?: (data: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
  onReactivateUi?: (names: string[], vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
}
```

See the [Extensions Authoring Guide](/extensions/authoring) for details.

## Control Types

### VistaDefaultCtrl

Built-in control names.

```typescript
type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';
```

### Control Positions

```typescript
type ControlPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';
```

## Pointer Types

### VistaPointerArgs

Arguments for the pointer tracking system.

```typescript
interface VistaPointerArgs {
  elm: HTMLElement;
  onUpdate?: (pointers: VistaPointer[]) => void;
  onEnd?: (pointers: VistaPointer[]) => void;
}
```

### VistaPointer

Individual pointer state. See [VistaPointer](/api-reference/types#vistapointer) in Types for complete definition.

```typescript
interface VistaPointer {
  id: number;
  x: number;
  y: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  type: 'mouse' | 'touch' | 'pen';
  button: number;
  timestamp: number;
}
```

## Internal Classes (Advanced)

These classes are exported for advanced use cases:

### VistaView

Main view controller class.

### VistaState

State management class.

### VistaBox

Base class for image containers. Extend this to create custom content types (videos, maps, etc.).

### VistaImage

Individual image instance class (extends VistaBox).

### VistaPointers

Multi-pointer tracking system.

### VistaImageEvent

Event handling system.

### VistaHiresTransition

High-resolution image transition manager.

## Default Behavior Functions

These functions implement the default behavior and can be used in custom function overrides:

### init

Default initialization function.

```typescript
import { init } from 'vistaview';
```

### open

Default open function.

```typescript
import { open } from 'vistaview';
```

### close

Default close function.

```typescript
import { close } from 'vistaview';
```

### transition

Default transition animation function.

```typescript
import { transition } from 'vistaview';
```

### imageSetup

Default image setup function.

```typescript
import { imageSetup } from 'vistaview';
```

### DefaultOptions

Default configuration options object.

```typescript
import { DefaultOptions } from 'vistaview';
```

## Utility Functions

### parseElement

Parses a DOM element or image config into a `VistaParsedElm`.

```typescript
import { parseElement } from 'vistaview/lib/utils';

const parsed = parseElement(element, index);
```

## TypeScript Best Practices

### Import Types

Always import types separately:

```typescript
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaParamsNeo, VistaData } from 'vistaview';
```

### Strict Configuration

Use types for strict configuration:

```typescript
import type { VistaParamsNeo } from 'vistaview';

const config: VistaParamsNeo = {
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
};

const gallery = vistaView(config);
```

### Extension Typing

Type your custom extensions:

```typescript
import type { VistaExtension, VistaData, VistaParsedElm } from 'vistaview';
import type { VistaView } from 'vistaview';

export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onImageView: (data: VistaData, view: VistaView) => {
      // Fully typed
    },
  };
}
```

## Next Steps

- Learn about [events and lifecycle](/core/events)
- Explore [extensions](/extensions/overview)
- Read the [Extensions Authoring Guide](/extensions/authoring)
