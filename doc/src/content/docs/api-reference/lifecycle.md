---
title: Lifecycle Functions
description: Custom lifecycle functions for overriding default behavior
---

Lifecycle functions allow you to override VistaView's default behavior at key stages.

## Lifecycle Function Types

### VistaInitFn

Type for custom initialization function. Runs once when `vistaView()` is called.

```typescript
type VistaInitFn = (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
import { init } from 'vistaview';

vistaView({
  elements: '#gallery a',
  initFunction: (vistaView) => {
    // Call default initialization
    init(vistaView);

    // Add custom initialization
    console.log('Custom initialization');
    console.log('Total images:', vistaView.state.elmLength);
  },
});
```

### VistaImageSetupFn

Type for custom setup function when navigating between images.

```typescript
type VistaImageSetupFn = (data: VistaData, vistaView: VistaView) => void;
```

**Parameters:**

- `data: VistaData` - Navigation data
- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
import { imageSetup } from 'vistaview';

vistaView({
  elements: '#gallery a',
  imageSetupFunction: (data, vistaView) => {
    // Call default setup
    imageSetup(data, vistaView);

    // Custom setup logic
    console.log('Setting up image:', data.index.to);
  },
});
```

### VistaTransitionFn

Type for custom transition animation function.

```typescript
type VistaTransitionFn = (
  data: VistaData,
  abortSignal: AbortSignal,
  vistaView: VistaView
) => { cleanup: () => void; transitionEnded: Promise<void> } | void;
```

**Parameters:**

- `data: VistaData` - Navigation data
- `abortSignal: AbortSignal` - Signal to abort the transition
- `vistaView: VistaView` - The VistaView instance

**Returns:** Object with cleanup function and promise, or void

**Example:**

```typescript
import { transition } from 'vistaview';

vistaView({
  elements: '#gallery a',
  transitionFunction: (data, abortSignal, vistaView) => {
    // Use default transition
    return transition(data, abortSignal, vistaView);
  },
});
```

**Custom transition example:**

```typescript
vistaView({
  elements: '#gallery a',
  transitionFunction: (data, abortSignal, vistaView) => {
    const elements = data.htmlElements;

    // Custom fade transition
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
        cleanup: () => {
          // Cleanup if needed
        },
        transitionEnded,
      };
    }
  },
});
```

### VistaCloseFn

Type for custom close function.

```typescript
type VistaCloseFn = (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
import { close } from 'vistaview';

vistaView({
  elements: '#gallery a',
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
  elements: '#gallery a',
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
  elements: '#gallery a',
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
  elements: '#gallery a',
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
  elements: '#gallery a',
  imageSetupFunction: (data, vistaView) => {
    imageSetup(data, vistaView);
    // Add custom setup logic
  },
});
```

### DefaultOptions

Default configuration options object.

```typescript
import { DefaultOptions } from 'vistaview';

console.log('Default zoom level:', DefaultOptions.maxZoomLevel);
console.log('Default preloads:', DefaultOptions.preloads);
```

## Complete Example

```typescript
import { vistaView, init, imageSetup, transition, close } from 'vistaview';
import type { VistaData } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',

  initFunction: (vistaView) => {
    // Custom initialization
    console.log('Initializing gallery with', vistaView.state.elmLength, 'images');

    // Call default init
    init(vistaView);

    // Additional setup
    document.body.classList.add('gallery-initialized');
  },

  imageSetupFunction: (data, vistaView) => {
    // Pre-setup logic
    console.log('Setting up image:', data.index.to);

    // Call default setup
    imageSetup(data, vistaView);

    // Post-setup logic
    const currentImage = data.images.to![Math.floor(data.images.to!.length / 2)];
    console.log('Image size:', currentImage.fullW, 'x', currentImage.fullH);
  },

  transitionFunction: (data, abortSignal, vistaView) => {
    // Use default transition
    const result = transition(data, abortSignal, vistaView);

    // Log transition
    console.log('Transitioning from', data.index.from, 'to', data.index.to);

    return result;
  },

  closeFunction: (vistaView) => {
    // Pre-close logic
    console.log('Closing at index:', vistaView.state.index);

    // Call default close
    close(vistaView);

    // Post-close cleanup
    document.body.classList.remove('gallery-initialized');
  },
});
```

## Custom Transition Example

Create a slide transition:

```typescript
vistaView({
  elements: '#gallery a',
  transitionFunction: (data, abortSignal, vistaView) => {
    const { from: fromElms, to: toElms } = data.htmlElements;

    if (!fromElms || !toElms) {
      return;
    }

    const direction = data.via.next ? 1 : -1;
    const distance = window.innerWidth;

    // Set initial positions
    toElms.forEach((elm) => {
      elm.style.transform = `translateX(${direction * distance}px)`;
      elm.style.transition = 'transform 400ms ease-out';
    });

    fromElms.forEach((elm) => {
      elm.style.transition = 'transform 400ms ease-out';
    });

    // Trigger animation
    requestAnimationFrame(() => {
      toElms.forEach((elm) => {
        elm.style.transform = 'translateX(0)';
      });

      fromElms.forEach((elm) => {
        elm.style.transform = `translateX(${-direction * distance}px)`;
      });
    });

    // Handle abort
    let aborted = false;
    abortSignal.addEventListener('abort', () => {
      aborted = true;
    });

    const transitionEnded = new Promise<void>((resolve) => {
      setTimeout(() => {
        if (!aborted) {
          resolve();
        }
      }, 450);
    });

    return {
      cleanup: () => {
        // Cleanup resources
      },
      transitionEnded,
    };
  },
});
```

## Related

- [Main Function](/api-reference/main-function)
- [Event Callbacks](/api-reference/events)
- [Lifecycle Configuration Guide](/core/configuration/lifecycle)
