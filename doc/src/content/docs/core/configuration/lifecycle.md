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

import type { VistaView, VistaData } from 'vistaview';


  elements: '#gallery a',

  // Custom initialization (runs once on instance creation)

  initFunction: (vistaView: VistaView) => {
    console.log('Custom init');
    // default init, just here to show the actual init
    init(vistaView);
  },

  // Custom open behavior (runs when lightbox opens)

  openFunction: (vistaView: VistaView) => {
    console.log('Custom open');
    // default open, just here to show the actual open
    open(vistaView);
  },

  // Custom setup when navigating between images

  imageSetupFunction: (data: VistaData, vistaView: VistaView) => {
    console.log('Setting up image:', data.index.to);
    // default imageSetup, just here to show the actual imageSetup
    imageSetup(data, vistaView);
  },

  // Custom transition animation

  transitionFunction: async (
    data: VistaData, 
    abortSignal: AbortSignal, 
    vistaView: VistaView
  ): Promise<{ cleanup: () => void; transitionEnded: Promise<void> } | undefined> => {
    console.log('Custom transition');
    // default transition, just here to show the actual transition
    return transition(data, abortSignal, vistaView);
  },

  // Custom close behavior (runs when lightbox closes)

  closeFunction: (vistaView: VistaView) => {
    console.log('Custom close');
    // default close, just here to show the actual close
    close(vistaView);
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
