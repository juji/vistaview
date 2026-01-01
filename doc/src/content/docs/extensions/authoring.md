---
title: Extensions Authoring Guide
description: Learn how to create custom extensions for VistaView
---

This guide explains how to create custom extensions for VistaView. Extensions allow you to add additional functionality to the lightbox without modifying the core library.

## Extension Interface

All extensions must implement the `VistaExtension` interface:

```typescript
interface VistaExtension {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (parsed: VistaParsedElm) => VistaBox | void | null | undefined;
  onImageView?: (data: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
  onReactivateUi?: (names: string[], vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
}
```

### Properties

- **`name`** (required): Unique identifier for your extension
- **`description`** (optional): Human-readable description
- **`control`** (optional): Returns an HTML element to be added to the UI
- **`onInitializeImage`** (optional): Called when each image is initialized. Can return a custom `VistaBox`
- **`onImageView`** (optional): Called when navigating to an image
- **`onContentChange`** (optional): Called when image content changes
- **`onDeactivateUi`** (optional): Called when UI should be disabled
- **`onReactivateUi`** (optional): Called when UI should be enabled
- **`onOpen`** (optional): Called when lightbox opens
- **`onClose`** (optional): Called when lightbox closes

## 1. UI Extensions

UI extensions add visible controls to the lightbox.

### Example: Download Button

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

const downloadIcon = `<svg viewBox="0 0 24 24">
  <path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <path d="m7 10 5 5 5-5"/>
</svg>`;

export function download(): VistaExtension {
  let currentImage: string | null = null;
  let currentAlt: string | null = null;
  let button: HTMLButtonElement | null = null;

  return {
    name: 'download',
    control: () => {
      button = document.createElement('button');
      button.setAttribute('aria-label', 'Download');
      button.innerHTML = downloadIcon;

      button.addEventListener('click', async () => {
        if (!currentImage || button?.classList.contains('vvw--pulsing')) return;
        button?.classList.add('vvw--pulsing');

        const response = await fetch(currentImage);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = currentAlt || 'download.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        button?.classList.remove('vvw--pulsing');
      });

      return button;
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const centerImage = vistaData.images.to?.[Math.floor(vistaData.images.to.length / 2)];
      if (centerImage) {
        currentImage = centerImage.image;
        currentAlt = centerImage.config.alt || null;
      }
    },
    onDeactivateUi: (names: string[], _v: VistaView) => {
      if (names.includes('download') && button) {
        button.setAttribute('disabled', 'true');
      }
    },
    onReactivateUi: (names: string[], _v: VistaView) => {
      if (names.includes('download') && button) {
        button.removeAttribute('disabled');
      }
    },
    onClose: (_v: VistaView) => {
      button?.remove();
      button = null;
      currentImage = null;
      currentAlt = null;
    },
  };
}
```

**Usage:**

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
```

## 2. Behavior Extensions

Behavior extensions don't add UI but provide functionality through lifecycle hooks.

### Example: Logger

```typescript
import type { VistaData, VistaExtension, VistaParsedElm, VistaView } from 'vistaview';

export function logger(): VistaExtension {
  return {
    name: 'logger',
    onInitializeImage: (parsed: VistaParsedElm) => {
      console.debug('Logger: Image initialized:', parsed);
    },
    onOpen: (vistaView: VistaView) => {
      console.debug('Logger: Opened', vistaView);
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      console.debug('Logger: Image viewed', vistaData);
    },
    onClose: (vistaView: VistaView) => {
      console.debug('Logger: Closed', vistaView);
    },
  };
}
```

## 3. Custom Content Extensions

Extensions can provide custom `VistaBox` implementations for different content types.

### Example: YouTube Video Extension

```typescript
import type { VistaExtension, VistaParsedElm } from 'vistaview';
import { VistaBox } from 'vistaview';

function parseYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

class VistaYoutubeVideo extends VistaBox {
  element: HTMLIFrameElement;

  constructor(par: any) {
    super(par);

    const iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('vvw-img-hi');

    this.element = iframe;

    const maxWidth = Math.min(window.innerWidth, 800);
    const { width: fullWidth, height: fullHeight } = {
      width: maxWidth,
      height: (maxWidth * 9) / 16,
    };

    this.fullH = fullHeight;
    this.fullW = fullWidth;
    this.minW = this.fullW * 0.5;
    this.maxW = this.fullW;
    iframe.width = fullWidth.toString();
    iframe.height = fullHeight.toString();

    this.setSizes({ stableSize: false, initDimension: true });

    iframe.onload = () => this.isLoadedResolved!(true);
    iframe.onerror = (e) => this.isLoadedRejected!(e);

    const videoId = parseYouTubeVideoId(par.elm.config.src);
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, 800);
    return { width: maxWidth, height: (maxWidth * 9) / 16 };
  }

  setFinalTransform() {
    return super.setFinalTransform({ propagateEvent: false });
  }
}

export function youtubeVideo(): VistaExtension {
  return {
    name: 'youtubeVideo',
    onInitializeImage: (params: VistaParsedElm) => {
      const url = params.config.src;
      const videoId = parseYouTubeVideoId(url);

      if (!videoId) return;

      return new VistaYoutubeVideo(params);
    },
  };
}
```

### Key Points for Custom VistaBox:

1. **Always call `super(par)` first** - Initializes the parent class
2. **Set `this.element`** - Your custom HTML element
3. **Set dimensions** - `fullW`, `fullH`, `minW`, `maxW`
4. **Override methods** - `getFullSizeDim()`, `setFinalTransform()`, etc.

## 4. Complex Extensions

Complex extensions combine UI, state management, and async operations.

### Example: Image Story Extension

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';
import DOMPurify from 'isomorphic-dompurify';

type StoryResult = {
  content: string;
  onLoad?: () => void;
  onUnload?: () => void;
};

export function imageStory({
  getStory,
  maxStoryCache = 5,
}: {
  getStory: (imageIndex: number) => Promise<StoryResult>;
  maxStoryCache?: number;
}): VistaExtension {
  let storyCache: { [key: string]: StoryResult } = {};
  let currentIndex = '';
  let container: HTMLDivElement | null = null;
  let storyText: HTMLDivElement | null = null;

  return {
    name: 'imageStory',
    control: () => {
      container = document.createElement('div');
      container.classList.add('vvw-story');

      const storyContainer = document.createElement('div');
      storyContainer.classList.add('vvw-story-container');

      storyText = document.createElement('div');
      storyText.classList.add('vvw-story-text');

      const storyButton = document.createElement('button');
      storyButton.classList.add('vvw-story-button');
      storyButton.innerHTML = '▲';
      storyButton.addEventListener('click', () => {
        storyText?.classList.toggle('expanded');
        storyButton.classList.toggle('expanded');
      });

      storyContainer.appendChild(storyText);
      storyContainer.appendChild(storyButton);
      container.appendChild(storyContainer);

      return container;
    },
    onClose(_v: VistaView) {
      if (currentIndex !== '') {
        storyCache[currentIndex]?.onUnload?.();
      }
      storyCache = {};
      currentIndex = '';
      container?.remove();
      container = null;
      storyText = null;
    },
    onImageView: async (vistaData: VistaData, _v: VistaView) => {
      const index = vistaData.index.to ?? -1;

      if (currentIndex !== '' && `${index}` !== currentIndex) {
        storyCache[currentIndex]?.onUnload?.();
      }

      currentIndex = `${index}`;

      if (`${index}` in storyCache) {
        const story = storyCache[`${index}`];
        if (storyText) storyText.innerHTML = story.content || '';
        story.onLoad?.();
      } else {
        if (storyText) storyText.innerHTML = 'Loading...';

        const story = await getStory(index);
        story.content = DOMPurify.sanitize(story.content);
        storyCache[`${index}`] = story;

        if (storyText) storyText.innerHTML = story.content || '';
        story.onLoad?.();
      }
    },
  };
}
```

## Best Practices

### 1. Memory Management

Always clean up in `onClose`:

```typescript
onClose() {
  button?.removeEventListener('click', handleClick);
  button?.remove();
  button = null;
  cache = {};
}
```

### 2. State Management

Use closure variables for persistent state:

```typescript
export function myExtension(): VistaExtension {
  let currentIndex = -1; // Persists across calls
  let cache = new Map();

  return {
    name: 'myExtension',
    onImageView: (data) => {
      currentIndex = data.index.to ?? -1;
    },
  };
}
```

### 3. Async Operations

Handle async properly with cleanup:

```typescript
onImageView: async (data) => {
  const controller = new AbortController();

  try {
    const result = await fetch(url, { signal: controller.signal });
    // Process result
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error('Failed:', error);
  }
};
```

### 4. CSS Styling

Use the `vvw-` prefix:

```css
.vvw-my-extension {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border-radius: var(--vvw-ui-border-radius);
}
```

### 5. Accessibility

Make UI elements accessible:

```typescript
control: () => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Descriptive label');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  return button;
};
```

### 6. TypeScript

Always use proper types:

```typescript
import type { VistaExtension, VistaData, VistaView } from 'vistaview';

export function myExtension(): VistaExtension {
  return {
    name: 'myExtension',
    onImageView: (data: VistaData, view: VistaView) => {
      // Fully typed
    },
  };
}
```

## Lifecycle Event Order

### On Open

1. `initFunction`
2. `Extension.onOpen`
3. `onOpen` callback
4. `setupFunction`
5. `Extension.onImageView`
6. `onImageView` callback

### On Navigate

1. `setupFunction`
2. `Extension.onImageView`
3. `onImageView` callback

### On Close

1. `closeFunction`
2. `Extension.onClose`
3. `onClose` callback

## Publishing Your Extension

When publishing:

1. Export as a function returning `VistaExtension`
2. Include TypeScript definitions
3. Document configuration options
4. Provide usage examples
5. List `vistaview` as peer dependency

```json
{
  "name": "vistaview-extension-example",
  "peerDependencies": {
    "vistaview": "^0.10.0"
  }
}
```

## Next Steps

- See [built-in extensions](/extensions/overview) for examples
- Review the [API Reference](/core/api-reference)
- Check the [source code](https://github.com/juji/vistaview/tree/main/src/lib/extensions)
