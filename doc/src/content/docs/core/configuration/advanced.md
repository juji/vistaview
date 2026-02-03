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
  imageSetupFunction: (data, vistaView) => {
    console.log('Setting up image:', data.index.to);
    imageSetup(data, vistaView); // Call default imageSetup
  },

  // Custom transition animation
  transitionFunction: async (data, abortSignal, vistaView) => {
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

See the [API Reference](/api-reference/main-function) for more details on these functions.
