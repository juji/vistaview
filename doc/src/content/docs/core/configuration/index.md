---
title: Configuration
description: Complete configuration reference for VistaView
---

VistaView provides extensive configuration options to customize the lightbox behavior and appearance.

## Basic Configuration

```typescript
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a', // Required: selector or array of images
});
```

## Complete Options

```typescript
vistaView({
  // Required: specify elements
  elements: string | VistaImgConfig[],

  // Animation & Timing
  animationDurationBase: 333, // Base animation duration in ms
  rapidLimit: 222, // Minimum time between rapid actions in ms

  // Zoom & Navigation
  maxZoomLevel: 2, // Maximum zoom multiplier (1 = 100%, 2 = 200%, etc.)
  preloads: 1, // Number of adjacent images to preload on each side

  // UI Controls
  keyboardListeners: true, // Enable keyboard navigation
  arrowOnSmallScreens: false, // Show prev/next arrows on screens < 768px
  initialZIndex: 1, // Starting z-index for the lightbox (optional)

  // Control Placement
  controls: {
    topLeft: ['indexDisplay'], // Array of control names
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
    bottomRight: [],
    bottomCenter: [],
  },

  // Extensions
  extensions: [], // Array of extension objects

  // Event Callbacks
  onOpen: (vistaView) => {}, // Called when lightbox opens
  onClose: (vistaView) => {}, // Called when lightbox closes
  onImageView: (data) => {}, // Called when viewing an image

  // Advanced: Custom Behavior Functions
  initFunction: (vistaView) => {}, // Custom initialization
  setupFunction: (data) => {}, // Custom setup when navigating
  transitionFunction: (data, abortSignal) => {}, // Custom transition animation
  closeFunction: (vistaView) => {}, // Custom cleanup on close
});
```

## Configuration Sections

- [Basic Configuration](/core/configuration/basic) - Getting started essentials
- [Elements Configuration](/core/configuration/elements) - How to specify images
- [Animation Options](/core/configuration/animation) - Timing and transitions
- [Zoom Options](/core/configuration/zoom) - Zoom behavior
- [Preloading](/core/configuration/preloading) - Image preloading settings
- [Control Configuration](/core/configuration/controls) - UI controls placement
- [Keyboard & UI Options](/core/configuration/keyboard) - Keyboard and mobile settings
- [Event Callbacks](/core/configuration/events) - Lifecycle events
- [Data Attributes](/core/configuration/data-attributes) - HTML data attributes
- [Advanced Functions](/core/configuration/advanced) - Custom behavior overrides
- [TypeScript Support](/core/configuration/typescript) - Type definitions

## Next Steps

- Learn about [events and lifecycle](/core/events)
- Explore [keyboard shortcuts and gestures](/core/keyboard-gestures)
- Discover [extensions](/extensions/overview)
