---
title: Extensions
description: Extension system types and interfaces
---

Extensions allow you to add custom functionality, content types, and UI controls to VistaView.

**Extension Types:** See [Types](/api-reference/types) for:

- [VistaExtension](/api-reference/types#vistaextension) - Extension interface
- [VistaDefaultCtrl](/api-reference/types#vistadefaultctrl) - Built-in control names
- [VistaImageParams](/api-reference/types#vistaimageparams) - Parameters for `onInitializeImage`

## Creating Extensions

Extensions implement the [VistaExtension](/api-reference/types#vistaextension) interface with optional hooks:

- `name` (required) - Unique identifier
- `description` (optional) - Human-readable description
- `control()` (optional) - Returns custom UI control element
- `onInitializeImage()` (optional) - Replace default image creation
- `onImageView()` (optional) - Triggered on navigation
- `onContentChange()` (optional) - Triggered on content/zoom changes
- `onDeactivateUi()` / `onReactivateUi()` (optional) - UI control state
- `onOpen()` / `onClose()` (optional) - Lightbox lifecycle

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

## Control Configuration

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

See [VistaDefaultCtrl](/api-reference/types#vistadefaultctrl) for built-in control names.

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

### Other Classes

- [**VistaView**](/api-reference/classes/vistaview) - Main view controller class (available in all callbacks)
- [**VistaState**](/api-reference/classes/vistastate) - State management (accessible via `vistaView.state`)
- [**VistaBox**](/api-reference/classes/vistabox) - Base class for content containers
- [**VistaImage**](/api-reference/classes/vistaimage) - Individual image instance (extends VistaBox)
- [**VistaPointers**](/api-reference/classes/vistapointers) - Multi-pointer tracking system (see [VistaPointer](/api-reference/types#vistapointer))
- [**VistaImageEvent**](/api-reference/classes/vistaimageevent) - Event handling system
- [**VistaHiresTransition**](/api-reference/classes/vistahirestransition) - High-resolution image transition manager

## Utility Functions

### parseElement

Parses a DOM element or image config into parsed element data.

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
- [Types](/api-reference/types)
- [Extensions Authoring Guide](/extensions/authoring)
- [Built-in Extensions](/extensions/overview)
