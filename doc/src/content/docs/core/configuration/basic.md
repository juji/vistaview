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
vista.reset(); // Recalculate elements; for selectors: re-queries DOM and re-attaches click listeners; for arrays: updates element count only
vista.destroy(); // Clean up and remove lightbox
```

**VistaInterface Type:**

```typescript
interface VistaInterface {
  open: (startIndex?: number) => void; // Open at specific index
  close: () => Promise<void>; // Close lightbox
  reset: () => void; // For selectors: re-queries DOM & re-attaches click listeners; For arrays: updates count only
  next: () => void; // Go to next image
  prev: () => void; // Go to previous image
  zoomIn: () => void; // Zoom in current image
  zoomOut: () => void; // Zoom out current image
  destroy: () => void; // Remove lightbox completely
  getCurrentIndex: () => number; // Get current image index
  view: (index: number) => void; // Navigate to specific index
}
```

## Multiple Gallery Configurations

When you need different lightbox configurations across different sections of your application, you have two main approaches:

### Approach 1: Multiple Instances (Recommended)

Create separate VistaView instances for each gallery with different configurations:

```typescript
// Product gallery with zoom enabled
const productGallery = vistaView({
  elements: '#product-images a',
  maxZoomLevel: 3,
  arrowOnSmallScreens: true,
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'close'],
  },
});

// Portfolio gallery with minimal UI
const portfolioGallery = vistaView({
  elements: '#portfolio a',
  maxZoomLevel: 1, // No zoom
  keyboardListeners: false,
  controls: {
    topRight: ['close'],
  },
});

// Blog gallery with downloads
import { download } from 'vistaview/extensions/download';

const blogGallery = vistaView({
  elements: '#blog-post img',
  extensions: [download()],
});
```

**Advantages:**

- Each gallery is independent with its own configuration
- Different extensions per gallery
- No need to reconfigure or reset
- Straightforward and maintainable

**Memory:**

- Each instance maintains its own state and event listeners
- Automatically cleaned up when you call `destroy()`

### Approach 2: Single Instance with Dynamic Content

Use a single instance and update content dynamically. The approach differs based on whether you use selectors or arrays:

#### With String Selectors (DOM-based)

Update the DOM, then call `reset()` to re-query elements and re-attach listeners:

```typescript
const vista = vistaView({
  elements: '#dynamic-gallery a',
  maxZoomLevel: 2,
});

// Function to update gallery DOM
function updateGallery(images: Array<{ src: string; alt: string }>) {
  const gallery = document.querySelector('#dynamic-gallery');

  // Update DOM
  gallery.innerHTML = images
    .map(
      (img) => `
    <a href="${img.src}">
      <img src="${img.src}" alt="${img.alt}" />
    </a>
  `
    )
    .join('');

  // Re-query DOM and re-attach click listeners
  vista.reset();
}

// Usage
const productImages = [
  { src: '/products/1.jpg', alt: 'Product 1' },
  { src: '/products/2.jpg', alt: 'Product 2' },
];

document.querySelector('#show-products')?.addEventListener('click', () => {
  updateGallery(productImages);
  // Click on images to open, or call vista.open(0)
});
```

**How `reset()` works with selectors:**

- Re-queries the DOM using the original selector
- Updates `state.elmLength`
- Removes and re-attaches click event listeners
- Images become clickable automatically

#### With Arrays (Programmatic)

Mutate the array reference, then call `reset()` to update count:

```typescript
// Create array that will be mutated
const currentImages: VistaImgConfig[] = [];

const vista = vistaView({
  elements: currentImages, // Stores the array reference
  maxZoomLevel: 2,
});

// Function to update gallery content
function updateGallery(newImages: VistaImgConfig[], startIndex = 0) {
  // Mutate the original array (don't reassign!)
  currentImages.length = 0;
  currentImages.push(...newImages);

  // Update element count
  vista.reset();

  // Must call open() programmatically (no click listeners)
  vista.open(startIndex);
}

// Usage
const portfolioImages = [
  { src: '/portfolio/1.jpg', alt: 'Portfolio 1' },
  { src: '/portfolio/2.jpg', alt: 'Portfolio 2' },
];

document.querySelector('#show-portfolio')?.addEventListener('click', () => {
  updateGallery(portfolioImages);
});
```

**How `reset()` works with arrays:**

- Reads `this.elements.length` to update count
- Does NOT attach click listeners (arrays have no DOM elements)
- You must call `open()` programmatically

**Advantages (both):**

- Single instance reduces memory
- Good for SPAs with dynamic content
- All content shares same configuration

**Limitations (both):**

- Cannot change configuration after initialization
- All galleries share same settings (zoom, extensions, controls)

### When to Destroy Instances

Always destroy instances when they're no longer needed:

```typescript
// Before page navigation in SPAs
function cleanup() {
  productGallery.destroy();
  portfolioGallery.destroy();
  blogGallery.destroy();
}

// In React
useEffect(() => {
  const vista = vistaView({ elements: '#gallery a' });
  return () => vista.destroy();
}, []);

// In Vue
onUnmounted(() => {
  vista.destroy();
});
```

### Recommendation

- **Use multiple instances** when galleries need different configurations (zoom, extensions, controls)
- **Use single instance with array** for programmatic galleries in SPAs where all galleries share configuration
- **Use selector updates** for simple galleries where only the image set changes

## Next Steps

- Explore [Animation Options](/core/configuration/animation) for timing control
- Discover [Controls](/core/configuration/controls) for UI customization
- See all available options in the [Complete Options](/core/configuration/complete)
