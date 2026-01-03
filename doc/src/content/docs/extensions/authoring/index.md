---
title: Extensions Authoring Guide
description: Learn how to create custom extensions for VistaView
---

This guide explains how to create custom extensions for VistaView. Extensions allow you to add additional functionality to the lightbox without modifying the core library.

## What Are Extensions?

Extensions are modular plugins that hook into VistaView's lifecycle to add features like:

- **UI Controls** - Custom buttons and interface elements
- **Behaviors** - Logging, analytics, keyboard shortcuts
- **Content Types** - Videos, maps, custom media
- **Enhanced Features** - Image stories, annotations, sharing

## Extension Interface

All extensions must implement the `VistaExtension` interface:

```typescript
interface VistaExtension {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (par: VistaImageParams) => VistaBox | void | null | undefined;
  onImageView?: (data: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
  onReactivateUi?: (names: string[], vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
}
```

### Properties

- **`name`** (required): Unique identifier for your extension
- **`description`** (optional): Human-readable description
- **`control`** (optional): Returns an HTML element to be added to the UI
- **`onInitializeImage`** (optional): Called when each image is initialized. Can return a custom `VistaBox`
- **`onImageView`** (optional): Called when navigating to an image
- **`onContentChange`** (optional): Called when image content changes
- **`onDeactivateUi`** (optional): Called when UI should be disabled
- **`onReactivateUi`** (optional): Called when UI should be enabled
- **`onOpen`** (optional): Called when lightbox opens
- **`onClose`** (optional): Called when lightbox closes

## Extension Types

### 1. UI Extensions

Add visible controls to the lightbox interface.

**Examples:** Download button, share button, fullscreen toggle

[Learn more →](/extensions/authoring/ui-extensions)

### 2. Behavior Extensions

Add functionality without visible UI.

**Examples:** Logging, analytics, keyboard shortcuts

[Learn more →](/extensions/authoring/behavior-extensions)

### 3. Content Extensions

Support custom content types by providing custom `VistaBox` implementations.

**Examples:** YouTube videos, maps, 360° images

[Learn more →](/extensions/authoring/content-extensions)

### 4. Complex Extensions

Combine UI, state management, and async operations.

**Examples:** Image stories, annotations, slideshows

[Learn more →](/extensions/authoring/complex-extensions)

## Quick Start

The simplest extension:

```typescript
import type { VistaExtension } from 'vistaview';

export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onOpen: (vistaView) => {
      console.log('Lightbox opened!');
    },
  };
}
```

Usage:

```typescript
import { vistaView } from 'vistaview';
import { myExtension } from './my-extension';

vistaView({
  elements: '#gallery a',
  extensions: [myExtension()],
});
```

## Lifecycle Event Order

Understanding when hooks are called:

### On Open

1. `initFunction`
2. `Extension.onOpen`
3. `onOpen` callback
4. `setupFunction`
5. `Extension.onImageView`
6. `onImageView` callback

### On Navigate

1. `setupFunction`
2. `Extension.onImageView`
3. `onImageView` callback

### On Close

1. `closeFunction`
2. `Extension.onClose`
3. `onClose` callback

## Next Steps

- [UI Extensions](/extensions/authoring/ui-extensions) - Add custom controls
- [Behavior Extensions](/extensions/authoring/behavior-extensions) - Add functionality without UI
- [Content Extensions](/extensions/authoring/content-extensions) - Support custom content types
- [Best Practices](/extensions/authoring/best-practices) - Memory management, accessibility, TypeScript
- [Publishing](/extensions/authoring/publishing) - Share your extension
