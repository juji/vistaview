---
title: Event Callbacks
description: Event callback functions and data types
---

Event callbacks allow you to hook into different stages of the lightbox lifecycle.

## Event Callback Types

### onOpen

Triggered when the lightbox opens.

```typescript
onOpen?: (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  onOpen: (vistaView) => {
    console.log('Lightbox opened');
    console.log('Total images:', vistaView.state.elmLength);
  },
});
```

### onClose

Triggered when the lightbox closes.

```typescript
onClose?: (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  onClose: (vistaView) => {
    console.log('Lightbox closed');
    console.log('Was viewing index:', vistaView.state.index);
  },
});
```

### onImageView

Triggered when navigating between images or when opening at a specific image.

```typescript
onImageView?: (data: VistaData, vistaView: VistaView) => void;
```

**Parameters:**

- `data: VistaData` - Navigation data with from/to information
- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data, vistaView) => {
    console.log('Navigated from:', data.index.from, 'to:', data.index.to);
    console.log('Via next:', data.via.next, 'Via prev:', data.via.prev);

    // Update custom UI
    const total = vistaView.state.elmLength;
    document.querySelector('#counter')!.textContent = `${data.index.to! + 1} / ${total}`;
  },
});
```

### onContentChange

Triggered when content changes (including zoom operations).

```typescript
onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
```

**Parameters:**

- `content: VistaImageClone` - The changed content
- `vistaView: VistaView` - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery a',
  onContentChange: (content, vistaView) => {
    console.log('Content changed');
    console.log('Current scale:', content.scale);
  },
});
```

## Event Data Types

### VistaData

Data passed to event callbacks and transition functions.

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

**Properties:**

- `htmlElements.from` - Previous HTML elements (for transitions)
- `htmlElements.to` - New HTML elements (for transitions)
- `images.from` - Previous image objects
- `images.to` - New image objects
- `index.from` - Previous image index (null on initial open)
- `index.to` - New image index
- `via.next` - True if navigated via next
- `via.prev` - True if navigated via previous

**Example usage:**

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data, vistaView) => {
    // Check navigation direction
    if (data.via.next) {
      console.log('User went to next image');
    } else if (data.via.prev) {
      console.log('User went to previous image');
    }

    // Get main image
    const mainImage = data.images.to![Math.floor(data.images.to!.length / 2)];
    console.log('Main image:', mainImage);

    // Access HTML element
    const htmlElm = data.htmlElements.to![Math.floor(data.htmlElements.to!.length / 2)];
    console.log('Alt text:', htmlElm.querySelector('img')?.alt);
  },
});
```

### VistaParsedElm

Parsed element information passed to extensions.

```typescript
interface VistaParsedElm {
  config: VistaImgConfig;
  origin: VistaImgOrigin | null;
  index: number;
}
```

**Properties:**

- `config` - Image configuration (src, alt, srcSet)
- `origin` - Origin element position and size (for animations)
- `index` - Image index in the gallery

### VistaImgOrigin

Origin element properties for animations.

```typescript
interface VistaImgOrigin {
  elm: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
}
```

**Properties:**

- `elm` - The original HTML element
- `x` - X position on page
- `y` - Y position on page
- `w` - Width in pixels
- `h` - Height in pixels

## Complete Example

```typescript
import { vistaView } from 'vistaview';
import type { VistaData } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',

  onOpen: (vistaView) => {
    console.log('Gallery opened');
    document.body.classList.add('lightbox-active');
  },

  onClose: (vistaView) => {
    console.log('Gallery closed');
    document.body.classList.remove('lightbox-active');
  },

  onImageView: (data, vistaView) => {
    const { from, to } = data.index;
    const total = vistaView.state.elmLength;

    console.log(`Viewing image ${to! + 1} of ${total}`);

    if (from !== null) {
      console.log(`Navigated from image ${from + 1}`);
    }

    // Update custom counter
    const counter = document.querySelector('#custom-counter');
    if (counter) {
      counter.textContent = `${to! + 1} / ${total}`;
    }

    // Direction
    if (data.via.next) {
      console.log('→ Next');
    } else if (data.via.prev) {
      console.log('← Previous');
    }

    // Access image data
    const mainImage = data.images.to![Math.floor(data.images.to!.length / 2)];
    console.log('Image dimensions:', mainImage.fullW, 'x', mainImage.fullH);
  },

  onContentChange: (content, vistaView) => {
    console.log('Zoom level:', content.scale.toFixed(2) + 'x');
  },
});
```

## Analytics Example

Track lightbox usage with analytics:

```typescript
vistaView({
  elements: '#gallery a',

  onOpen: () => {
    // Track lightbox open
    gtag('event', 'lightbox_open', {
      event_category: 'Gallery',
      event_label: 'Image Gallery',
    });
  },

  onImageView: (data) => {
    // Track image views
    gtag('event', 'image_view', {
      event_category: 'Gallery',
      event_label: `Image ${data.index.to! + 1}`,
    });
  },

  onClose: (vistaView) => {
    // Track session duration
    const viewedIndex = vistaView.state.index;
    gtag('event', 'lightbox_close', {
      event_category: 'Gallery',
      event_label: `Last viewed: ${viewedIndex + 1}`,
    });
  },
});
```

## Related

- [Main Function](/api-reference/main-function)
- [Lifecycle Functions](/api-reference/lifecycle)
- [Events Configuration Guide](/core/configuration/events)
