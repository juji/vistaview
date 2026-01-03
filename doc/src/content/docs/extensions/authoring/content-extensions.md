---
title: Content Extensions
description: Support custom content types by extending VistaBox
---

Content extensions allow VistaView to display custom content types beyond images. They implement `onInitializeImage` to return custom `VistaBox` instances.

## VistaBox Overview

`VistaBox` is the base class that handles content display, sizing, and transitions. To support custom content:

1. Extend `VistaBox`
2. Set `this.element` to your custom DIV element
3. Define dimensions (`fullW`, `fullH`, `minW`, `maxW`)
4. Override methods as needed

## Basic Content Extension

```typescript
import type { VistaExtension, VistaImageParams } from 'vistaview';
import { VistaBox } from 'vistaview';

class VistaCustomContent extends VistaBox {
  element: HTMLDivElement;

  constructor(par: VistaImageParams) {
    super(par); // Always call super first

    // Create your custom element
    this.element = document.createElement('div');
    this.element.classList.add('vvw-img-hi');
    this.element.textContent = 'Custom Content';

    // Set dimensions
    const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5; // Required: tells VistaView when to close (size threshold)
    this.maxW = this.fullW;

    this.element.style.width = `${fullWidth}px`;
    this.element.style.height = `${fullHeight}px`;

    // Initialize sizes
    this.setSizes({ stableSize: false, initDimension: true });

    // Mark as loaded
    this.isLoadedResolved!(true);
  }

  protected getFullSizeDim(): { width: number; height: number } {
    return { width: 800, height: 600 };
  }
}

export function customContent(): VistaExtension {
  return {
    name: 'customContent',
    onInitializeImage: (params: VistaImageParams) => {
      // Check if this element should use custom content
      if (params.elm.config.src.includes('custom')) {
        return new VistaCustomContent(params);
      }
    },
  };
}
```

## Video Extension Example

Complete YouTube video extension:

```typescript
import type { VistaData, VistaExtension, VistaImageParams } from 'vistaview';
import { VistaBox } from 'vistaview';
import type { VistaView } from 'vistaview';

function parseYouTubeVideoId(url: string): string | null {
  if (!url) return null;

  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/live\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function getYouTubeThumbnail(videoUrl: string): string {
  const videoId = parseYouTubeVideoId(videoUrl);
  if (!videoId) throw new Error('Invalid YouTube video URL');
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export class VistaYoutubeVideo extends VistaBox {
  element: HTMLDivElement;
  url: string;

  constructor(par: VistaImageParams) {
    super(par);

    const url = par.elm.config.src;
    this.url = url;

    // Create container with thumbnail
    const div = document.createElement('div');
    div.style.position = 'relative';

    // youtube thumbnail view
    // for initial iframe loading
    const image = document.createElement('img');
    div.appendChild(image);
    image.src = this.origin?.image.src || getYouTubeThumbnail(url);
    image.style.width = '100%';
    image.style.height = '100%';
    image.style.objectFit = 'cover';
    image.classList.add('vvw--pulsing');

    // add vvw-img-hi clas to the div
    // so the animation will run
    this.element = div;
    this.element.classList.add('vvw-img-hi');

    // Set dimensions
    const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();
    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5; // Required: tells VistaView when to close (size threshold)
    this.maxW = this.fullW;

    this.element.style.width = `${fullWidth}px`;
    this.element.style.height = `${fullHeight}px`;

    // Initialize sizes
    // always do this
    this.setSizes({ stableSize: false, initDimension: true });

    // Load iframe when in center position
    if (this.pos === 0) {
      const iframe = document.createElement('iframe');
      iframe.frameBorder = '0';
      iframe.allow =
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
      iframe.allowFullscreen = true;
      iframe.width = '100%';
      iframe.height = '100%';
      iframe.style.position = 'absolute';
      iframe.style.top = '0';
      iframe.style.left = '0';
      iframe.style.backgroundColor = 'transparent';
      iframe.style.opacity = '0';
      iframe.style.transition = 'opacity 1s ease';
      iframe.src = `https://www.youtube.com/embed/${parseYouTubeVideoId(url)}?autoplay=1&rel=0`;
      div.appendChild(iframe);

      iframe.onload = () => {
        iframe.style.opacity = '1';
        image.classList.remove('vvw--pulsing');
      };
    }

    this.isLoadedResolved!(true);
  }

  // for videos, the full size have a max width
  // so we extend this function
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, 800);
    return {
      width: maxWidth,
      height: (maxWidth * 9) / 16,
    };
  }

  // final transform should not propagate events,
  // since we don't need it for videos
  setFinalTransform() {
    return super.setFinalTransform({ propagateEvent: false });
  }
}

export function youtubeVideo(): VistaExtension {
  return {
    name: 'ytVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseYouTubeVideoId(url);
      if (!videoId) return;

      return new VistaYoutubeVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaYoutubeVideo) {
        // deactivate these on display
        v.deactivateUi(['download', 'zoomIn', 'zoomOut'], mainData);
      }
    },
  };
}
```

Usage:

```html
<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" data-thumbnail="thumb.jpg">
  <img src="thumb.jpg" alt="Video" />
</a>
```

```typescript
vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo()],
});
```

## Key Points

### Constructor Requirements

```typescript
constructor(par: VistaImageParams) {
  super(par); // ALWAYS call first

  // Create your element
  this.element = document.createElement('div');
  this.element.classList.add('vvw-img-hi');

  // Get dimensions
  const { width: fullWidth, height: fullHeight } = this.getFullSizeDim();

  // Set dimensions
  this.fullW = fullWidth;
  this.fullH = fullHeight;
  this.minW = fullWidth * 0.5;
  this.maxW = fullWidth;

  // Set element size
  this.element.style.width = `${fullWidth}px`;
  this.element.style.height = `${fullHeight}px`;

  // Initialize
  this.setSizes({ stableSize: false, initDimension: true });

  // Handle loading
  this.isLoadedResolved!(true); // or wait for async load
}
```

### Override Methods

```typescript
// Required: Return full dimensions
protected getFullSizeDim(): { width: number; height: number } {
  const maxWidth = Math.min(window.innerWidth, 800);
  return {
    width: maxWidth,
    height: (maxWidth * 9) / 16,
  };
}

// Optional: Custom transform behavior
setFinalTransform() {
  return super.setFinalTransform({ propagateEvent: false });
}
```

```typescript
constructor(par: VistaImageParams) {
  super(par); // ALWAYS call first

  // Create your element
  this.element = document.createElement('div');

  // Set dimensions
  this.fullW = 800;
  this.fullH = 600;
  this.minW = 400;
  this.maxW = 1200;

  // Initialize
  this.setSizes({ stableSize: false, initDimension: true });

  // Handle loading
  this.isLoadedResolved!(true); // or wait for async load
}
```

**Key Points:**

- `element` must be set in constructor
- Call `getFullSizeDim()` to get dimensions, then apply to `element.style`
- Must call `isLoadedResolved!(true)` when ready
- Can call `isLoadedRejected!(error)` on failure

## Handling Content Detection

Check attributes or URL patterns in `onInitializeImage`:

```typescript
export function myPdfContent(): VistaExtension {
  return {
    name: 'myPdfContent',
    onInitializeImage: (par: VistaImageParams) => {
      const url = par.elm.config.src;
      const type = par.elm.elm.getAttribute('data-type');

      // Check by URL pattern
      if (url.includes('yourpdfsite.com')) {
        return new MyVistaPDF(par);
      }
    },
  };
}
```

## Next Steps

- [Complex Extensions](/extensions/authoring/complex-extensions)
- [Best Practices](/extensions/authoring/best-practices)
- [Built-in Video Extensions](/extensions/overview)
