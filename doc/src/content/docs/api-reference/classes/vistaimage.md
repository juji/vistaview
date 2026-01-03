---
title: VistaImage Class
description: Image implementation extending VistaBox
---

The `VistaImage` class extends [VistaBox](#vistabox) and implements image-specific functionality including responsive images, hi-res loading, and zoom/pan controls.

## Overview

`VistaImage` is the default content type used by VistaView for displaying images. It automatically handles:

- Progressive image loading with thumbnails
- Responsive images with `srcset` support
- Zoom and pan interactions
- Hi-resolution image transitions

## Usage

Typically, you don't instantiate `VistaImage` directly - [VistaView](/api-reference/classes/vistaview) creates instances automatically. However, you can reference it when creating custom extensions.

```typescript
import { VistaImage } from 'vistaview';

// Used internally by VistaView
const image = new VistaImage(params);
```

## Public Properties

Inherits all properties from [VistaBox](#vistabox):

- `element` - HTMLImageElement containing the image
- `state` - Current dimensions and transformations
- `pos` - Position relative to current image
- `index` - Gallery index
- `config` - Image configuration
- `origin` - Origin element information
- `isReady` - Whether image has loaded
- `thumb` - Thumbnail element

## Public Methods

### constructor()

```typescript
constructor(par: VistaImageParams)
```

Creates a new VistaImage instance with automatic image loading.

### Inherited Methods

All public methods from [VistaBox](#vistabox) are available:

- `init()` - Initialize the image
- `setSizes()` - Calculate dimensions
- `prepareClose()` - Prepare for closing
- `cancelPendingLoad()` - Cancel loading
- `destroy()` - Clean up resources
- `cloneStyleFrom()` - Copy style from another instance
- `toObject()` - Serialize current state
- `setInitialCenter()` - Set zoom center point

## Related

- [VistaBox](#vistabox) - Base class
- [VistaView](/api-reference/classes/vistaview) - Main controller
- [Extensions](/api-reference/extensions) - Creating custom content types
