---
title: Extensions
description: Extension system types and interfaces
---

Extensions allow you to add custom functionality, content types, and UI controls to VistaView.

## VistaExtension

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

### Properties

#### name (required)

Unique identifier for the extension.

```typescript
name: string;
```

#### description (optional)

Human-readable description.

```typescript
description?: string;
```

#### control (optional)

Returns a custom UI control element.

```typescript
control?: () => HTMLElement | null;
```

#### onInitializeImage (optional)

Hook to replace default image creation with custom content.

```typescript
onInitializeImage?: (parsed: VistaParsedElm) => VistaBox | void | null | undefined;
```

**Example:**

```typescript
onInitializeImage: (parsed) => {
  if (parsed.config.src.includes('youtube.com')) {
    return new CustomVideoBox(parsed);
  }
};
```

#### onImageView (optional)

Triggered when navigating between images.

```typescript
onImageView?: (data: VistaData, vistaView: VistaView) => void;
```

#### onContentChange (optional)

Triggered when content changes (including zoom).

```typescript
onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
```

#### onDeactivateUi (optional)

Triggered when UI controls are deactivated.

```typescript
onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
```

#### onReactivateUi (optional)

Triggered when UI controls are reactivated.

```typescript
onReactivateUi?: (names: string[], vistaView: VistaView) => void;
```

#### onOpen (optional)

Triggered when lightbox opens.

```typescript
onOpen?: (vistaView: VistaView) => void;
```

#### onClose (optional)

Triggered when lightbox closes.

```typescript
onClose?: (vistaView: VistaView) => void;
```

## Extension Example

Simple logger extension:

```typescript
import type { VistaExtension, VistaData } from 'vistaview';
import type { VistaView } from 'vistaview';

export function logger(): VistaExtension {
  return {
    name: 'logger',
    description: 'Logs all lightbox events',

    onOpen: (vistaView) => {
      console.log('[Logger] Opened');
    },

    onClose: (vistaView) => {
      console.log('[Logger] Closed');
    },

    onImageView: (data, vistaView) => {
      console.log('[Logger] Image view:', data.index.to);
    },

    onContentChange: (content, vistaView) => {
      console.log('[Logger] Content changed, scale:', content.scale);
    },
  };
}

// Usage
vistaView({
  elements: '#gallery a',
  extensions: [logger()],
});
```

## Control Types

### VistaDefaultCtrl

Built-in control names.

```typescript
type VistaDefaultCtrl = 'indexDisplay' | 'zoomIn' | 'zoomOut' | 'close' | 'description';
```

### ControlPosition

Control placement positions.

```typescript
type ControlPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'bottomCenter';
```

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['close'],
    bottomCenter: ['indexDisplay'],
    bottomRight: ['zoomIn', 'zoomOut'],
  },
});
```

## Advanced Types

### VistaParsedElm

Parsed element information passed to `onInitializeImage`.

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

## Advanced Classes

These classes are exported for advanced use cases:

### VistaBox

Base class for content containers. Extend this to create custom content types.

```typescript
import { VistaBox } from 'vistaview';
import type { VistaImageParams } from 'vistaview';

export class CustomContentBox extends VistaBox {
  element: HTMLDivElement;

  constructor(params: VistaImageParams) {
    super(params);

    // Create custom element
    this.element = document.createElement('div');
    this.element.innerHTML = '<p>Custom content</p>';

    // Setup required
    this.element.classList.add('vvw-img-hi');
    this.fullW = 800;
    this.fullH = 600;
    this.minW = 400;
    this.maxW = 800;

    this.element.style.width = `${this.fullW}px`;
    this.element.style.height = `${this.fullH}px`;

    this.setSizes({ stableSize: false, initDimension: true });
    this.isLoadedResolved!(true);
  }
}
```

### VistaView

Main view controller class. Available in all callbacks.

### VistaState

State management class accessible via `vistaView.state`.

### VistaImage

Individual image instance class (extends VistaBox).

### VistaPointers

Multi-pointer tracking system.

### VistaImageEvent

Event handling system.

### VistaHiresTransition

High-resolution image transition manager.

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

Individual pointer state.

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

## Utility Functions

### parseElement

Parses a DOM element or image config into a `VistaParsedElm`.

```typescript
import { parseElement } from 'vistaview/lib/utils';

const parsed = parseElement(element, index);
```

## Complete Extension Example

Custom download button extension:

```typescript
import type { VistaExtension, VistaData } from 'vistaview';
import type { VistaView } from 'vistaview';

export function downloadButton(): VistaExtension {
  let downloadBtn: HTMLButtonElement | null = null;

  return {
    name: 'downloadButton',
    description: 'Adds a download button',

    control: () => {
      downloadBtn = document.createElement('button');
      downloadBtn.innerHTML = '⬇️ Download';
      downloadBtn.className = 'vvw-download-btn';
      downloadBtn.style.cssText = `
        padding: 8px 16px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      `;

      downloadBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Download logic here
      });

      return downloadBtn;
    },

    onImageView: (data, vistaView) => {
      if (downloadBtn) {
        const mainImage = data.images.to![Math.floor(data.images.to!.length / 2)];
        const src = mainImage.origin?.elm.querySelector('img')?.src || '';

        // Update download URL
        downloadBtn.onclick = (e) => {
          e.stopPropagation();
          const link = document.createElement('a');
          link.href = src;
          link.download = `image-${data.index.to! + 1}.jpg`;
          link.click();
        };
      }
    },
  };
}

// Usage
vistaView({
  elements: '#gallery a',
  extensions: [downloadButton()],
  controls: {
    bottomRight: ['downloadButton'],
  },
});
```

## Related

- [Main Function](/api-reference/main-function)
- [Event Callbacks](/api-reference/events)
- [Extensions Authoring Guide](/extensions/authoring)
- [Built-in Extensions](/extensions/overview)
