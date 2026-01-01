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
  setupFunction: (data) => {
    console.log('Setting up image:', data.index.to);
  },

  // Custom transition animation
  transitionFunction: async (data, abortSignal) => {
    // Use default transition
    return transition(data, abortSignal);
  },

  // Custom cleanup on close
  closeFunction: (vistaView) => {
    console.log('Custom close');
    close(vistaView); // Call default close
  },
});
```

See the [API Reference](/api-reference) for more details on these functions.
