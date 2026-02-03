---
title: Lifecycle Functions
description: Custom lifecycle functions for overriding default behavior
---

Lifecycle functions allow you to override VistaView's default behavior at key stages.

**Lifecycle Function Types:** See [Types](/api-reference/types) for:

- [VistaInitFn](/api-reference/types#vistainitfn) - Custom initialization function
- [VistaImageSetupFn](/api-reference/types#vistaimagesetupfn) - Custom setup function
- [VistaTransitionFn](/api-reference/types#vistatransitionfn) - Custom transition function
- [VistaOpenFn](/api-reference/types#vistaopenfn) - Custom open function
- [VistaCloseFn](/api-reference/types#vistaclosefn) - Custom close function

## Usage Examples

### Custom Initialization

```typescript
import { vistaView, init } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  initFunction: (vistaView) => {
    // Call default initialization
    init(vistaView);

    // Add custom initialization
    console.log('Custom initialization');
    console.log('Total images:', vistaView.state.elmLength);
  },
});
```

### Custom Image Setup

```typescript
import { vistaView, imageSetup } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  imageSetupFunction: (data, vistaView) => {
    // Call default setup
    imageSetup(data, vistaView);

    // Custom setup logic
    console.log('Setting up image:', data.index.to);
  },
});
```

### Custom Transition

```typescript
import { vistaView, transition } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  transitionFunction: (data, abortSignal, vistaView) => {
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },
});
```

**Custom fade transition:**

```typescript
vistaView({
  elements: '#gallery > a',
  transitionFunction: (data, abortSignal, vistaView) => {
    const elements = data.htmlElements;

    if (elements.from && elements.to) {
      const fromElms = elements.from;
      const toElms = elements.to;

      // Fade out old images
      fromElms.forEach((elm) => {
        elm.style.transition = 'opacity 300ms ease';
        elm.style.opacity = '0';
      });

      // Fade in new images
      toElms.forEach((elm) => {
        elm.style.opacity = '0';
        elm.style.transition = 'opacity 300ms ease';
        setTimeout(() => (elm.style.opacity = '1'), 50);
      });

      const transitionEnded = new Promise<void>((resolve) => {
        setTimeout(resolve, 350);
      });

      return {
        cleanup: () => {},
        transitionEnded,
      };
    }
  },
});
```

### Custom Close

```typescript
import { vistaView, close } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  closeFunction: (vistaView) => {
    console.log('Custom close logic');

    // Call default close
    close(vistaView);
  },
});
```

## Default Behavior Functions

These functions implement the default behavior and can be imported for use in custom function overrides:

### init

Default initialization function.

```typescript
import { init } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  initFunction: (vistaView) => {
    init(vistaView);
    // Add custom logic after default init
  },
});
```

### open

Default open function.

```typescript
import { open } from 'vistaview';
```

### close

Default close function.

```typescript
import { close } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  closeFunction: (vistaView) => {
    // Custom logic before close
    console.log('Closing lightbox');

    // Call default close
    close(vistaView);
  },
});
```

### transition

Default transition animation function.

```typescript
import { transition } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  transitionFunction: (data, abortSignal, vistaView) => {
    return transition(data, abortSignal, vistaView);
  },
});
```

### imageSetup

Default image setup function.

```typescript
import { imageSetup } from 'vistaview';

vistaView({
  elements: '#gallery > a',
  imageSetupFunction: (data, vistaView) => {
    imageSetup(data, vistaView);
    // Add custom setup logic
  },
});
```

### DefaultOptions

Default configuration options object. See [VistaOpt](/api-reference/types#vistaopt) for all configuration options.

```typescript
import { DefaultOptions } from 'vistaview';

const DefaultOptions: VistaOpt = {
  animationDurationBase: 333,
  maxZoomLevel: 2,
  preloads: 1,
  keyboardListeners: true,
  arrowOnSmallScreens: false,
  rapidLimit: 222,
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
  },
};
```

## Related

- [Main Function](/api-reference/main-function)
- [Event Callbacks](/api-reference/events)
- [Types](/api-reference/types)
- [Lifecycle Configuration Guide](/core/configuration/lifecycle)
