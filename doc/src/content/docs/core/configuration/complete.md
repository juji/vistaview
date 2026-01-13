---
title: Options
description: Complete reference of all VistaView configuration options
---

This page provides a comprehensive reference of all available configuration options for VistaView.

## Default Options

The value you see here are the default values.

```typescript
vistaView({
  // Required: specify elements
  elements: string | VistaImgConfig[],

  // Animation & Timing
  animationDurationBase: 333, // Base animation duration in ms
  rapidLimit: 222, // Minimum time between rapid actions in ms

  // Zoom & Navigation
  maxZoomLevel: 2, // Maximum zoom multiplier (1 = 100%, 2 = 200%, etc.)

  // Number of adjacent images to preload on each side
  preloads: 1,

  // UI Controls
  keyboardListeners: true, // Enable keyboard navigation
  arrowOnSmallScreens: false, // Show prev/next arrows on screens < 768px

  initialZIndex: 1, // Starting z-index for the lightbox

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
  onImageView: (data, vistaView) => {}, // Called when viewing an image
  onContentChange: (content, vistaView) => {}, // Called when image content changes

  // Lifecycle: Custom Behavior Functions (override defaults)
  initFunction: undefined, // Custom initialization (default: sets up swipe gestures)
  openFunction: undefined, // Custom open behavior (default: positions image container)
  imageSetupFunction: undefined, // Custom setup when navigating (default: none)
  transitionFunction: undefined, // Custom transition animation (default: slide animation)
  closeFunction: undefined, // Custom close behavior (default: none)
});
```

## Detailed Documentation

For detailed explanations and examples of each option, refer to the specific configuration sections:

- **[Basic Configuration](/core/configuration/basic)** - Getting started essentials
- **[Animation Options](/core/configuration/animation)** - Timing and transitions
- **[Zoom Options](/core/configuration/zoom)** - Zoom behavior
- **[Preloading](/core/configuration/preloading)** - Image preloading settings
- **[Control Configuration](/core/configuration/controls)** - UI controls placement
- **[Keyboard & UI Options](/core/configuration/keyboard)** - Keyboard and mobile settings
- **[Z-Index Configuration](/core/configuration/z-index)** - Z-index stacking
- **[Event Callbacks](/core/configuration/events)** - Lifecycle events
- **[Data Attributes](/core/configuration/data-attributes)** - HTML data attributes
- **[Lifecycle Functions](/core/configuration/lifecycle)** - Custom behavior overrides
