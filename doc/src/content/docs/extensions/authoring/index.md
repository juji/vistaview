---
title: Extensions Authoring Guide
description: Learn how to create custom extensions for VistaView
---

Extensions are objects that implement the `VistaExtension` interface and hook into the lightbox lifecycle. You pass them in the `extensions` array when initializing VistaView, and they can add UI controls, respond to navigation events, replace image rendering with custom content, and more.

## The VistaExtension Interface

```typescript
import type {
  VistaExtension,
  VistaImageParams,
  VistaData,
  VistaImageClone,
  VistaView,
  VistaBox,
} from 'vistaview';

const myExtension: VistaExtension = {
  // Required: unique name used to reference this extension in controls config
  name: 'myExtension',

  // Optional: shown in aria-label when the extension provides a control
  description: 'My custom extension',

  // Optional: return an HTMLElement to add to the UI toolbar
  control: () => { /* ... */ return button; },

  // Optional: intercept image initialization — return a VistaBox to replace default image
  onInitializeImage: (params: VistaImageParams) => { /* ... */ },

  // Optional: called when the lightbox opens
  onOpen: (vistaView: VistaView) => { /* ... */ },

  // Optional: called when navigating to an image
  onImageView: (data: VistaData, vistaView: VistaView) => { /* ... */ },

  // Optional: called when image content changes (pan, zoom, etc.)
  onContentChange: (content: VistaImageClone, vistaView: VistaView) => { /* ... */ },

  // Optional: called when UI controls are disabled (e.g. video is shown)
  onDeactivateUi: (names: string[], requestBy: VistaBox | null, vistaView: VistaView) => { /* ... */ },

  // Optional: called when UI controls are re-enabled
  onReactivateUi: (names: string[], requestBy: VistaBox | null, vistaView: VistaView) => { /* ... */ },

  // Optional: called when the lightbox closes
  onClose: (vistaView: VistaView) => { /* ... */ },
};
```

## Quick Start

The minimal extension — just a name and one hook:

```typescript
import type { VistaExtension } from 'vistaview';
import { vistaView } from 'vistaview';

export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onOpen: (v) => {
      console.log('Lightbox opened, total images:', v.state.elmLength);
    },
  };
}

vistaView({
  elements: '#gallery > a',
  extensions: [myExtension()],
});
```

## Extension Types

There are three patterns, each covered in its own guide:

### UI Extensions

Add a button or other control element to the toolbar. The `control()` method returns the element; you register it in the `controls` config by the extension's `name`.

Use `onDeactivateUi` / `onReactivateUi` to respond when other extensions disable controls (for example, video extensions disable zoom and download).

→ [UI Extensions guide](/extensions/authoring/ui-extensions)

### Behavior Extensions

React to lifecycle events without any visible UI — logging, analytics, keyboard shortcuts, auto-play, etc. These only use the `on*` hooks.

→ [Behavior Extensions guide](/extensions/authoring/behavior-extensions)

### Content Extensions

Intercept `onInitializeImage` and return a custom `VistaBox` subclass to replace the default image renderer. Used for videos, maps, iframes, or any non-image content.

→ [Content Extensions guide](/extensions/authoring/content-extensions)

## Lifecycle Event Order

### On open

1. `onOpen` (all extensions)
2. `onInitializeImage` (per image, for preloaded images)
3. `onImageView` (for the initial image)

### On navigate

1. `onInitializeImage` (for newly preloaded images)
2. `onImageView`

### On close

1. `onClose` (all extensions)

## Using Extensions with Controls

If your extension provides a `control()`, register it by name in the `controls` configuration:

```typescript
vistaView({
  elements: '#gallery > a',
  extensions: [myExtension()],
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'myExtension', 'close'],
  },
});
```

The extension name and the string in the controls array must match exactly.

## Next Steps

- [UI Extensions](/extensions/authoring/ui-extensions) — add buttons and toolbar elements
- [Behavior Extensions](/extensions/authoring/behavior-extensions) — hook into events without UI
- [Content Extensions](/extensions/authoring/content-extensions) — render custom content types
- [Built-in Extensions](/extensions/overview) — see real examples
