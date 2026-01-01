---
title: Events & Lifecycle
description: Understanding VistaView events and lifecycle hooks
---

VistaView provides event callbacks and a comprehensive lifecycle system for tracking and responding to lightbox state changes.

## Event Callbacks

### onOpen

Called when the lightbox opens.

```typescript
vistaView({
  elements: '#gallery a',
  onOpen: (vistaView) => {
    console.log('Lightbox opened');
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
  },
});
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

### onClose

Called when the lightbox closes.

```typescript
vistaView({
  elements: '#gallery a',
  onClose: (vistaView) => {
    console.log('Lightbox closed');
    // Restore body scrolling
    document.body.style.overflow = '';
  },
});
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

### onImageView

Called when viewing an image (including on initial open).

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data) => {
    console.log('Current image:', data.index.to);
    console.log('Previous image:', data.index.from);
    console.log('Direction:', data.direction);

    // Track analytics
    if (data.index.to !== null) {
      gtag('event', 'image_view', {
        image_index: data.index.to,
      });
    }
  },
});
```

**Parameters:**

- `data: VistaData` - Event data containing indices, images, and direction

#### VistaData Structure

```typescript
interface VistaData {
  htmlElements: {
    from: HTMLElement[] | null; // Previous HTML elements
    to: HTMLElement[] | null; // Current HTML elements
  };
  images: {
    from: VistaBox[] | null; // Previous images
    to: VistaBox[] | null; // Current images
  };
  index: {
    from: number | null; // Previous image index (null on open)
    to: number | null; // Current image index
  };
  via: {
    next: boolean; // True if navigated via next
    prev: boolean; // True if navigated via prev
  };
}
```

## Lifecycle Flow

Understanding the lifecycle helps you know when to hook into events:

### Opening the Lightbox

1. `gallery.open(index)` is called
2. `initFunction` runs (default: `init`)
3. `onOpen` callback fires
4. Initial image setup
5. `setupFunction` runs for the first image
6. `onImageView` callback fires
7. `transitionFunction` runs (fade-in animation)
8. Image loads and displays

### Navigating Between Images

1. `gallery.next()`, `gallery.prev()`, or `gallery.view(index)` is called
2. `setupFunction` runs for the new image
3. `onImageView` callback fires
4. `transitionFunction` runs (transition animation)
5. Image loads and displays

### Closing the Lightbox

1. `gallery.close()` is called or ESC key pressed
2. Exit animation plays
3. `closeFunction` runs (default: `close`)
4. `onClose` callback fires
5. DOM cleanup

## Extension Lifecycle

Extensions have their own lifecycle hooks:

### onInitializeImage

Called when each image is initialized during setup.

```typescript
export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onInitializeImage: (parsed: VistaParsedElm) => {
      console.log('Initializing image:', parsed.index);
      // Return custom VistaBox to override default behavior
    },
  };
}
```

### onOpen

Called when the lightbox opens.

```typescript
export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onOpen: (vistaView: VistaView) => {
      console.log('Extension: Lightbox opened');
    },
  };
}
```

### onImageView

Called when navigating to an image.

```typescript
export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onImageView: (data: VistaData, vistaView: VistaView) => {
      console.log('Extension: Viewing image', data.index.to);
    },
  };
}
```

### onContentChange

Called when image content changes (e.g., hi-res loads).

```typescript
export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onContentChange: (content: VistaImageClone, vistaView: VistaView) => {
      console.log('Extension: Content changed');
    },
  };
}
```

### onDeactivateUi / onReactivateUi

Called when UI elements should be enabled/disabled.

```typescript
export function myControl(): VistaExtension {
  let button: HTMLButtonElement | null = null;

  return {
    name: 'myControl',
    control: () => {
      button = document.createElement('button');
      button.textContent = 'My Action';
      return button;
    },
    onDeactivateUi: (names: string[], vistaView: VistaView) => {
      if (names.includes('myControl') && button) {
        button.setAttribute('disabled', 'true');
      }
    },
    onReactivateUi: (names: string[], vistaView: VistaView) => {
      if (names.includes('myControl') && button) {
        button.removeAttribute('disabled');
      }
    },
  };
}
```

### onClose

Called when the lightbox closes.

```typescript
export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onClose: (vistaView: VistaView) => {
      console.log('Extension: Lightbox closed');
      // Cleanup resources
    },
  };
}
```

## Lifecycle Timing

### Event Order on Open

```
1. gallery.open(index)
2. initFunction
3. Extension.onOpen
4. onOpen callback
5. setupFunction
6. Extension.onImageView
7. onImageView callback
8. transitionFunction (animation starts)
9. Extension.onContentChange (when hi-res loads)
10. (animation completes)
```

### Event Order on Navigate

```
1. gallery.next() / prev() / view(index)
2. setupFunction
3. Extension.onImageView
4. onImageView callback
5. transitionFunction (animation starts)
6. Extension.onContentChange (when hi-res loads)
7. (animation completes)
```

### Event Order on Close

```
1. gallery.close() or ESC key
2. (exit animation starts)
3. closeFunction
4. Extension.onClose
5. onClose callback
6. (animation completes)
7. DOM cleanup
```

## Practical Examples

### Track Image Views

```typescript
const viewCounts = new Map();

vistaView({
  elements: '#gallery a',
  onImageView: (data) => {
    if (data.index.to !== null) {
      const count = viewCounts.get(data.index.to) || 0;
      viewCounts.set(data.index.to, count + 1);
      console.log(`Image ${data.index.to} viewed ${count + 1} times`);
    }
  },
});
```

### Prevent Closing on Certain Conditions

```typescript
let preventClose = false;

const gallery = vistaView({
  elements: '#gallery a',
  closeFunction: (vistaView) => {
    if (preventClose) {
      console.log('Close prevented');
      return;
    }
    // Use default close
    import('vistaview').then(({ close }) => close(vistaView));
  },
});
```

### Custom Transitions Based on Direction

```typescript
import { transition } from 'vistaview';

vistaView({
  elements: '#gallery a',
  transitionFunction: async (data, abortSignal, vistaView) => {
    if (data.via.next) {
      console.log('Sliding to next image');
    } else if (data.via.prev) {
      console.log('Sliding to previous image');
    }

    // Use default transition
    return transition(data, abortSignal, vistaView);
  },
});
```

### Sync with External State

```typescript
// React example
function Gallery() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useVistaView({
    elements: '#gallery a',
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onImageView: (data) => {
      if (data.index.to !== null) {
        setCurrentIndex(data.index.to);
      }
    },
  });

  return (
    <>
      <div id="gallery">...</div>
      {isOpen && <div>Currently viewing image {currentIndex + 1}</div>}
    </>
  );
}
```

### Loading States

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data) => {
    // Show loading indicator
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'block';
  },
  // Hide when hi-res loads (use extension)
  extensions: [
    {
      name: 'loadingIndicator',
      onContentChange: () => {
        const loader = document.getElementById('loader');
        if (loader) loader.style.display = 'none';
      },
    },
  ],
});
```

## Next Steps

- Learn about [creating extensions](/extensions/authoring)
- See the [API Reference](/api-reference)
