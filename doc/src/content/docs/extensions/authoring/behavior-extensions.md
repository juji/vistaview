---
title: Behavior Extensions
description: Create extensions that add functionality without visible UI
---

Behavior extensions add functionality through lifecycle hooks without adding visible controls. They're perfect for logging, analytics, keyboard shortcuts, and other non-visual features.

## Basic Behavior Extension

```typescript
import type { VistaExtension } from 'vistaview';

export function simpleLogger(): VistaExtension {
  return {
    name: 'simpleLogger',
    onOpen: () => console.log('Opened'),
    onClose: () => console.log('Closed'),
  };
}
```

## Complete Example: Logger

A comprehensive logging extension:

```typescript
import type { VistaData, VistaExtension, VistaImageClone, VistaImageParams } from 'vistaview';
import type { VistaView } from 'vistaview';

export function logger(): VistaExtension {
  return {
    name: 'logger',
    onInitializeImage: (params: VistaImageParams) => {
      console.debug('Logger: VistaView initialized with params:');
      console.debug(params);
    },
    onContentChange: (_content: VistaImageClone, _v: VistaView) => {
      console.debug('Logger: Content changed');
      console.debug(_content);
    },
    onImageView: async (vistaData: VistaData, _v: VistaView) => {
      console.debug('Logger: Image viewed');
      console.debug(vistaData);
    },
    onOpen: async (_vistaView: VistaView) => {
      console.debug('Logger: VistaView opened');
      console.debug(_vistaView);
    },
    onClose: (_vistaView: VistaView) => {
      console.debug('Logger: VistaView closed');
      console.debug(_vistaView);
    },
  };
}
```

## Analytics Extension

Track user interactions:

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

export function analytics({
  trackEvent,
}: {
  trackEvent: (event: string, data: any) => void;
}): VistaExtension {
  let openTime: number;
  let viewCount = 0;

  return {
    name: 'analytics',

    onOpen: (vistaView: VistaView) => {
      openTime = Date.now();
      viewCount = 0;

      trackEvent('lightbox_open', {
        totalImages: vistaView.state.elmLength,
      });
    },

    onImageView: (vistaData: VistaData, _v: VistaView) => {
      viewCount++;

      trackEvent('image_view', {
        index: vistaData.index.to,
        viewNumber: viewCount,
      });
    },

    onClose: (_v: VistaView) => {
      const duration = Date.now() - openTime;

      trackEvent('lightbox_close', {
        duration,
        imagesViewed: viewCount,
        averageTimePerImage: duration / viewCount,
      });
    },
  };
}
```

Usage:

```typescript
vistaView({
  elements: '#gallery > a',
  extensions: [
    analytics({
      trackEvent: (event, data) => {
        // Send to your analytics service
        gtag('event', event, data);
      },
    }),
  ],
});
```

## Keyboard Shortcuts Extension

Add custom keyboard shortcuts:

```typescript
import type { VistaExtension, VistaView } from 'vistaview';

export function keyboardShortcuts(): VistaExtension {
  let vistaView: VistaView | null = null;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!vistaView) return;

    switch (e.key) {
      case 'f':
        // Toggle fullscreen
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else {
          document.documentElement.requestFullscreen();
        }
        break;

      case 'd':
        // Download current image
        // Trigger download logic
        break;

      case 'i':
        // Show image info
        console.log(vistaView.state);
        break;
    }
  };

  return {
    name: 'keyboardShortcuts',

    onOpen: (view: VistaView) => {
      vistaView = view;
      document.addEventListener('keydown', handleKeyDown);
    },

    onClose: () => {
      document.removeEventListener('keydown', handleKeyDown);
      vistaView = null;
    },
  };
}
```

## Preload Adjacent Images

**Note:** VistaView already handles image preloading internally. This example is provided for educational purposes to demonstrate behavior extension patterns.

```typescript
import type { VistaData, VistaExtension } from 'vistaview';

export function preloadAdjacent(): VistaExtension {
  const preloadCache = new Map<string, HTMLImageElement>();

  const preload = (src: string) => {
    if (preloadCache.has(src)) return;

    const img = new Image();
    img.src = src;
    preloadCache.set(src, img);
  };

  return {
    name: 'preloadAdjacent',

    onImageView: (vistaData: VistaData, vistaView: VistaView) => {
      const currentIndex = vistaData.index.to ?? 0;
      const total = vistaView.state.elmLength;

      // Preload next image
      const nextIndex = (currentIndex + 1) % total;
      const nextImage = vistaView.state.elms[nextIndex];
      if (nextImage?.config.src) {
        preload(nextImage.config.src);
      }

      // Preload previous image
      const prevIndex = (currentIndex - 1 + total) % total;
      const prevImage = vistaView.state.elms[prevIndex];
      if (prevImage?.config.src) {
        preload(prevImage.config.src);
      }
    },

    onClose: () => {
      preloadCache.clear();
    },
  };
}
```

## Auto-Play Slideshow

Automatic image rotation:

```typescript
import type { VistaExtension, VistaView } from 'vistaview';

export function autoPlay({
  interval = 3000,
}: {
  interval?: number;
} = {}): VistaExtension {
  let intervalId: number | null = null;
  let vistaView: VistaView | null = null;

  const startAutoPlay = () => {
    if (intervalId) return;

    intervalId = window.setInterval(() => {
      if (!vistaView) return;

      const currentIndex = vistaView.state.currElmIndex;
      const total = vistaView.state.elmLength;
      const nextIndex = (currentIndex + 1) % total;

      vistaView.go(nextIndex);
    }, interval);
  };

  const stopAutoPlay = () => {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };

  return {
    name: 'autoPlay',

    onOpen: (view: VistaView) => {
      vistaView = view;
      startAutoPlay();
    },

    onImageView: () => {
      // Reset timer on manual navigation
      stopAutoPlay();
      startAutoPlay();
    },

    onClose: () => {
      stopAutoPlay();
      vistaView = null;
    },
  };
}
```

## Image Counter Display

Show current position without adding a control:

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

export function imageCounter(): VistaExtension {
  let counterElement: HTMLDivElement | null = null;

  return {
    name: 'imageCounter',

    onOpen: (vistaView: VistaView) => {
      counterElement = document.createElement('div');
      counterElement.className = 'vvw-counter';
      counterElement.style.cssText = `
        position: absolute;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--vvw-ui-bg-color);
        color: var(--vvw-ui-text-color);
        padding: 8px 16px;
        border-radius: var(--vvw-ui-border-radius);
        font-size: 14px;
      `;

      vistaView.stage?.appendChild(counterElement);
    },

    onImageView: (vistaData: VistaData, vistaView: VistaView) => {
      const current = (vistaData.index.to ?? 0) + 1;
      const total = vistaView.state.elmLength;

      if (counterElement) {
        counterElement.textContent = `${current} / ${total}`;
      }
    },

    onClose: () => {
      counterElement?.remove();
      counterElement = null;
    },
  };
}
```

## Key Concepts

### Lifecycle Hooks

Behavior extensions use lifecycle hooks to react to events:

- `onOpen` - Lightbox opened, set up state
- `onImageView` - Image changed, update based on new image
- `onClose` - Lightbox closed, clean up resources

### State Persistence

Use closure variables to maintain state:

```typescript
export function statefulExtension(): VistaExtension {
  let count = 0;
  let cache = new Map();

  return {
    name: 'statefulExtension',
    onImageView: () => {
      count++; // Persists between calls
    },
  };
}
```

### Cleanup

Always clean up resources:

```typescript
onClose: () => {
  clearInterval(intervalId);
  document.removeEventListener('keydown', handler);
  cache.clear();
  vistaView = null;
};
```

## Next Steps

- [Content Extensions](/extensions/authoring/content-extensions)
- [Best Practices](/extensions/authoring/best-practices)
- [Built-in Extensions](/extensions/overview)
