---
title: Advanced Functions
description: Override default behavior with custom functions
---

For advanced customization, you can override default behavior functions:

```typescript
import { vistaView, transition, close } from 'vistaview';

vistaView({
  elements: '#gallery a',

  // Custom initialization (runs on open)
  initFunction: (vistaView) => {
    console.log('Custom init');
  },

  // Custom setup when navigating
  imageSetupFunction: (data, vistaView) => {
    console.log('Setting up image:', data.index.to);
  },

  // Custom transition animation
  transitionFunction: async (data, abortSignal, vistaView) => {
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },

  // Custom cleanup on close
  closeFunction: (vistaView) => {
    console.log('Custom close');
    close(vistaView); // Call default close
  },
});
```

See the [API Reference](/api-reference) for more details on these functions.
