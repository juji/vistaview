---
title: Lifecycle Functions
description: Override default lifecycle behavior with custom functions
---

You can override default lifecycle functions to customize behavior at different stages:

```typescript
import {
  vistaView,

  // lifecycle functions
  init,
  open,
  imageSetup,
  transition,
  close,
} from 'vistaview';

// types
import type { VistaData } from 'vistaview';

vistaView({
  elements: '#gallery a',

  // Custom initialization (runs once on instance creation)
  // Default init sets up swipe gesture controls:
  // - Vertical swipe down (>144px) closes the lightbox
  // - Horizontal swipe left/right (>64px) navigates between images
  // - Smart axis locking prevents diagonal movement
  initFunction: (vistaView) => {
    console.log('Custom init');
    init(vistaView); // Call default init
  },

  // Custom open behavior (runs when lightbox opens)
  // Default open sets up the image container:
  // - Sets container width based on preload count (preloads * 2 + 1) * 100vw
  // - Positions container to show current image with preloaded images on sides
  // - Sets display to flex for horizontal layout
  openFunction: (vistaView) => {
    console.log('Custom open');
    open(vistaView); // Call default open
  },

  // Custom setup when navigating between images
  // Default imageSetup is empty - it's a hook point for custom logic
  // Common use cases: logging, analytics, custom image processing
  imageSetupFunction: (data: VistaData, vistaView) => {
    console.log('Setting up image:', data.index.to);
    imageSetup(data, vistaView); // Call default imageSetup
  },

  // Custom transition animation
  // Default transition creates a horizontal slide animation:
  // - Only animates between adjacent images (next/previous)
  // - Respects prefers-reduced-motion setting (no animation if enabled)
  // - Slides left when going to next image, right when going to previous
  // - Uses animationDurationBase option for timing (default 333ms)
  // - Returns cleanup function and transitionEnded promise
  transitionFunction: async (data: VistaData, abortSignal, vistaView) => {
    console.log('Custom transition');
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },

  // Custom close behavior (runs when lightbox closes)
  // Default close is empty - it's a hook point for custom cleanup
  // Common use cases: analytics, state cleanup, custom animations
  closeFunction: (vistaView) => {
    console.log('Custom close');
    close(vistaView); // Call default close
  },
});
```

## VistaData Type

The `data` parameter passed to lifecycle functions contains information about the current and previous images:

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

See the [API Reference](/api-reference) for more details on these functions.
