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
  initFunction: (vistaView) => {
    console.log('Custom init');
    init(vistaView); // Call default init
  },

  // Custom open behavior (runs when lightbox opens)
  openFunction: (vistaView) => {
    console.log('Custom open');
    open(vistaView); // Call default open
  },

  // Custom setup when navigating between images
  imageSetupFunction: (data: VistaData, vistaView) => {
    console.log('Setting up image:', data.index.to);
    imageSetup(data, vistaView); // Call default imageSetup
  },

  // Custom transition animation
  transitionFunction: async (data: VistaData, abortSignal, vistaView) => {
    console.log('Custom transition');
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },

  // Custom close behavior (runs when lightbox closes)
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
