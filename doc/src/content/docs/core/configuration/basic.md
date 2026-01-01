---
title: Basic Configuration
description: Get started with basic VistaView configuration
---

Learn the fundamentals of configuring VistaView for your image galleries.

## Minimal Setup

The simplest way to use VistaView requires just two things: importing the library and specifying which elements to use.

### Using Anchor Tags (Recommended)

The recommended approach uses anchor tags wrapping images:

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>
```

```typescript
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

vistaView({
  elements: '#gallery a',
});
```

Benefits:

- Progressive loading from thumbnail to full-size
- Works without JavaScript
- SEO-friendly

### Using Images Directly

You can also select images directly:

```html
<div id="gallery">
  <img src="/images/thumb1.jpg" data-vistaview-src="/images/full1.jpg" alt="Photo 1" />
  <img src="/images/thumb2.jpg" data-vistaview-src="/images/full2.jpg" alt="Photo 2" />
</div>
```

```typescript
vistaView({
  elements: '#gallery img',
});
```

### Using Array of Images

You can also pass an array of image configuration objects directly:

```typescript
import type { VistaImgConfig } from 'vistaview';

const images: VistaImgConfig[] = [
  { src: '/images/photo1.jpg', alt: 'Photo 1' },
  { src: '/images/photo2.jpg', alt: 'Photo 2' },
  {
    src: '/images/photo3.jpg',
    alt: 'Photo 3',
    srcSet: '/images/photo3-800.jpg 800w, /images/photo3-1200.jpg 1200w',
  },
];

vistaView({
  elements: images,
});
```

**VistaImgConfig Type:**

```typescript
interface VistaImgConfig {
  src: string; // Full-size image URL (required)
  alt?: string; // Alt text for the image
  srcSet?: string; // Responsive image srcset attribute
}
```

**Note:** Thumbnails are not supported when using an array. This approach is best for programmatically generated galleries.

## Return Value

The `vistaView` function returns an instance with methods to control the lightbox programmatically:

```typescript
const vista = vistaView({
  elements: '#gallery a',
});

// Available methods:
vista.open(0); // Open lightbox at index 0
vista.close(); // Close the lightbox
vista.next(); // Navigate to next image
vista.prev(); // Navigate to previous image
vista.view(2); // Jump to image at index 2
vista.zoomIn(); // Zoom in
vista.zoomOut(); // Zoom out
vista.getCurrentIndex(); // Get current image index
vista.reset(); // Reset to initial state
vista.destroy(); // Clean up and remove lightbox
```

**VistaInterface Type:**

```typescript
interface VistaInterface {
  open: (startIndex?: number) => void; // Open at specific index
  close: () => Promise<void>; // Close lightbox
  reset: () => void; // Reset to initial state
  next: () => void; // Go to next image
  prev: () => void; // Go to previous image
  zoomIn: () => void; // Zoom in current image
  zoomOut: () => void; // Zoom out current image
  destroy: () => void; // Remove lightbox completely
  getCurrentIndex: () => number; // Get current image index
  view: (index: number) => void; // Navigate to specific index
}
```

## Next Steps

- Learn about [Elements Configuration](/core/configuration/elements) for more ways to specify images
- Explore [Animation Options](/core/configuration/animation) for timing control
- Discover [Controls](/core/configuration/controls) for UI customization
- See all available options in the [Configuration Overview](/core/configuration)
