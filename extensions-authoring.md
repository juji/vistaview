# Extensions Authoring Guide

This guide explains how to create custom extensions for VistaView. Extensions allow you to add additional functionality to the lightbox without modifying the core library.

## Extension Interface

All extensions must implement the `VistaExtension` interface:

```typescript
type VistaExtension = {
  name: string;
  description?: string;
  control?: () => HTMLElement | null;
  onInitializeImage?: (image: VistaParsedElm) => VistaBox | void | null | undefined;
  onImageView?: (params: VistaData, vistaView: VistaView) => void;
  onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
  onDeactivateUi?: (names: string[], vistaView: VistaView) => void;
  onReactivateUi?: (names: string[], vistaView: VistaView) => void;
  onOpen?: (vistaView: VistaView) => void;
  onClose?: (vistaView: VistaView) => void;
};
```

### Properties

- **`name`** (required): Unique identifier for your extension
- **`description`** (optional): Human-readable description of what the extension does
- **`control`** (optional): Function that returns an HTML element to be added to the UI
- **`onInitializeImage`** (optional): Called when each image is initialized. Receives `VistaParsedElm` and can return a custom `VistaBox` implementation to override the default `VistaImage`
- **`onImageView`** (optional): Called when navigating to an image (including initial open)
- **`onContentChange`** (optional): Called when the image content changes
- **`onDeactivateUi`** (optional): Called when UI elements should be deactivated/disabled. Receives an array of control names and the VistaView instance
- **`onReactivateUi`** (optional): Called when UI elements should be reactivated/enabled. Receives an array of control names and the VistaView instance
- **`onOpen`** (optional): Called when the lightbox opens
- **`onClose`** (optional): Called when the lightbox closes

## Extension Types

### 1. UI Extensions

UI extensions add visible controls to the lightbox. They return an HTML element via the `element()` function and can be placed in control areas (topLeft, topRight, bottomCenter, etc.).

**Example: Download Button**

```typescript
import type { VistaData, VistaExtension } from 'vistaview';
import type { VistaView } from 'vistaview';

const downloadIcon = `<svg viewBox="0 0 24 24"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>`;

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
        if (!currentImage) return;
        if (button?.classList.contains('vvw--pulsing')) return;
        button?.classList.add('vvw--pulsing');

        const response = await fetch(currentImage);
        const blob = await response.blob();
        const finalUrl = response.url;

        const extension = finalUrl.split('?')[0].split('#')[0].split('.').pop();
        const fileName = currentAlt
          ? `${currentAlt}.${extension}`
          : finalUrl.split('?')[0].split('#')[0].split('/').pop() || 'download.' + extension;

        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        button?.classList.remove('vvw--pulsing');
      });

      return button;
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const centerImage = vistaData.images.to
        ? vistaData.images.to[Math.floor(vistaData.images.to.length / 2)]
        : null;

      if (centerImage) {
        currentImage = centerImage.image;
        currentAlt = centerImage.config.alt || null;
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
    onClose: (_vistaView: VistaView) => {
      button?.remove();
      button = null;
      currentImage = null;
      currentAlt = null;
    },
      }
    },
  };
}
```

**Usage:**

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', download(), 'close'],
  },
});
```

### 2. Behavior Extensions

Behavior extensions don't add UI elements but provide functionality through lifecycle hooks. They're registered via the `extensions` option.

**Example: Logger**

```typescript
import type { VistaData, VistaExtension, VistaImageClone, VistaParsedElm } from 'vistaview';
import type { VistaView } from 'vistaview';

export function logger(): VistaExtension {
  return {
    name: 'logger',
    onInitializeImage: (parsed: VistaParsedElm) => {
      console.debug('Logger: VistaView initialized with parsed element:', parsed);
    },
    onContentChange: (content: VistaImageClone, _v: VistaView) => {
      console.debug('Logger: Content changed', content);
    },
    onImageView: (vistaData: VistaData, _v: VistaView) => {
      console.debug('Logger: Image viewed', vistaData);
    },
    onOpen: (vistaView: VistaView) => {
      console.debug('Logger: VistaView opened', vistaView);
    },
    onClose: (vistaView: VistaView) => {
      console.debug('Logger: VistaView closed', vistaView);
    },
  };
}
```

**Usage:**

```typescript
vistaView({
  elements: '#gallery a',
  extensions: [logger()],
});
```

### 3. Custom VistaBox Extensions

Extensions can provide custom implementations of `VistaBox` to handle different content types (videos, iframes, etc.). The `onInitializeImage` hook receives `VistaImageParams` and can return a custom `VistaBox` instance.

**Example: YouTube Video Extension**

```typescript
import type { VistaExtension, VistaImageParams } from 'vistaview';
import { VistaBox } from 'vistaview';

// Helper function to parse YouTube video IDs
function parseYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

// Custom VistaBox implementation for YouTube videos
class VistaYoutubeVideo extends VistaBox {
  element: HTMLIFrameElement;

  constructor(par: VistaImageParams) {
    // Call parent constructor first - this sets up thumb, state, etc.
    super(par);

    // Create iframe element
    const iframe = document.createElement('iframe');
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;
    iframe.classList.add('vvw-img-hi');

    this.element = iframe;

    // Set dimensions (16:9 aspect ratio)
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

    // Initialize sizes
    this.setSizes({ stableSize: false, initDimension: true });

    // Set up loading promises
    iframe.onload = () => this.isLoadedResolved!(true);
    iframe.onerror = (e) => this.isLoadedRejected!(e);

    // Set iframe source
    const videoId = parseYouTubeVideoId(par.elm.config.src);
    iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
  }

  // Override getFullSizeDim to return 16:9 aspect ratio
  protected getFullSizeDim(): { width: number; height: number } {
    const maxWidth = Math.min(window.innerWidth, 800);
    return { width: maxWidth, height: (maxWidth * 9) / 16 };
  }

  // Override setFinalTransform to prevent content change events for iframes
  setFinalTransform() {
    return super.setFinalTransform({ propagateEvent: false });
  }
}

// Extension factory function
export function youtubeVideo(): VistaExtension {
  return {
    name: 'youtubeVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const url = params.elm.config.src;
      const videoId = parseYouTubeVideoId(url);

      // Only handle YouTube URLs
      if (!videoId) return;

      // Return custom VistaBox implementation
      return new VistaYoutubeVideo(params);
    },
  };
}
```

**Key Points:**

1. **Constructor**: Always call `super(par)` first. This initializes the parent class including:
   - State management
   - Thumbnail handling
   - Initial positioning
   - Event tracking

2. **Element Property**: Set `this.element` to your custom HTML element (iframe, video, div, etc.)

3. **Dimensions**: Set `fullW`, `fullH`, `minW`, `maxW` properties to control sizing behavior

4. **Override Methods**: You can override protected methods like:
   - `getFullSizeDim()` - Custom size calculations
   - `onWidthChange()` - React to width changes
   - `onHeightChange()` - React to height changes
   - `setFinalTransform()` - Custom transform finalization
   - `normalize()` - Custom normalization behavior

5. **Base Implementations**: VistaBox provides default implementations for:
   - `init()` - Initialization and animation
   - `setSizes()` - Size calculations and positioning
   - `prepareClose()` - Cleanup before closing
   - `destroy()` - Full cleanup
   - `setInitialCenter()` - Set initial pointer position

**Usage:**

```typescript
vistaView({
  elements: '#gallery a',
  extensions: [youtubeVideo()],
});
```

**CSS Support:**

Make sure to include iframe support in your styles:

```css
.vvw-item iframe.vvw-img-hi {
  position: absolute;
  top: 50%;
  left: 50%;
  translate: -50% -50%;
}
```

### 4. Complex Extensions

Complex extensions can combine UI elements with state management and async operations.

**Example: Image Story Extension**

```typescript
import type { VistaData, VistaExtension } from 'vistaview';
import type { VistaView } from 'vistaview';
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
        if (storyText?.classList.contains('expanded')) {
          storyText.classList.remove('expanded');
          storyButton.classList.remove('expanded');
        } else {
          storyText?.classList.add('expanded');
          storyButton.classList.add('expanded');
        }
      });

      storyContainer.appendChild(storyText);
      storyContainer.appendChild(storyButton);
      container.appendChild(storyContainer);

      return container;
    },
    onClose(_vistaView: VistaView) {
      // Cleanup on close
      if (currentIndex !== '') {
        const story = storyCache[currentIndex];
        story?.onUnload?.();
      }
      storyCache = {};
      currentIndex = '';
      container?.remove();
      container = null;
      storyText = null;
    },
    onImageView: async (vistaData: VistaData, _v: VistaView) => {
      const index = vistaData.index.to ?? -1;

      // Cleanup previous story
      if (currentIndex !== '' && `${index}` !== currentIndex) {
        const previousStory = storyCache[currentIndex];
        previousStory?.onUnload?.();
      }

      currentIndex = `${index}`;

      // Load from cache or fetch
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

**Usage:**

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    bottomCenter: [
      imageStory({
        getStory: async (index) => ({
          content: '<p>Story for image ' + index + '</p>',
        }),
        maxStoryCache: 5,
      }),
    ],
  },
});
```

## Best Practices

### 1. Memory Management

Always clean up resources in the `onClose` hook:

```typescript
onClose() {
  // Remove event listeners
  button?.removeEventListener('click', handleClick);

  // Clear references
  button = null;
  container = null;

  // Clear caches
  cache = {};
}
```

### 2. State Management

Use closure variables to maintain state between lifecycle calls:

```typescript
export function myExtension(): VistaExtension {
  let currentIndex = -1; // State persists across calls
  let cache: Map<string, any> = new Map();

  return {
    name: 'myExtension',
    onImageView: (data) => {
      currentIndex = data.index.to ?? -1;
      // Access state here
    },
  };
}
```

### 3. Async Operations

Handle async operations properly and consider cleanup:

```typescript
onImageView: async (vistaData) => {
  const controller = new AbortController();

  try {
    const data = await fetch(url, { signal: controller.signal });
    // Process data
  } catch (error) {
    if (error.name === 'AbortError') {
      // Cleanup was triggered
      return;
    }
    console.error('Failed to load:', error);
  }
};
```

### 4. CSS Styling

Follow VistaView's CSS naming convention:

```css
/* Use vvw- prefix for your extension */
.vvw-my-extension {
  /* Your styles */
}

.vvw-my-extension-button {
  /* Button styles */
}

/* Respect CSS custom properties */
.vvw-my-extension {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border-radius: var(--vvw-ui-border-radius);
}
```

### 5. Accessibility

Make your UI elements accessible:

```typescript
control: () => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Descriptive label');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  return button;
};
```

### 6. TypeScript Types

ImpUI Deactivation and Reactivation

Extensions can respond to UI deactivation and reactivation requests. This is useful when certain content types (like videos or maps) don't support specific features like download or zoom.

**Example: Handling UI Deactivation**

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
    onDeactivateUi: (names: string[], _v: VistaView) => {
      // Disable this control if its name is in the deactivation list
      if (names.includes('myControl') && button) {
        button.setAttribute('disabled', 'true');
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      }
    },
    onReactivateUi: (names: string[], _v: VistaView) => {
      // Re-enable this control if its name is in the reactivation list
      if (names.includes('myControl') && button) {
        button.removeAttribute('disabled');
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
      }
    },
  };
}
```

**Triggering Deactivation from Extensions**

Extensions can trigger UI deactivation for specific content types. For example, video and map extensions deactivate download and zoom controls since these features don't apply to embedded content:

```typescript
export function youtubeVideo(): VistaExtension {
  return {
    name: 'youtubeVideo',
    onInitializeImage: (params: VistaImageParams) => {
      const videoId = parseYouTubeVideoId(params.elm.config.src);
      if (!videoId) return;
      return new VistaYoutubeVideo(params);
    },
    onImageView: async (data: VistaData, v: VistaView) => {
      const mainData = data.images.to![Math.floor(data.images.to!.length / 2)];
      if (mainData instanceof VistaYoutubeVideo) {
        // Deactivate controls that don't apply to videos
        v.deactivateUi(['download', 'zoomIn', 'zoomOut']);
      }
    },
  };
}
```

When the user navigates away from video/map content to regular images, the UI controls are automatically reactivated.

## ort and use proper types:

```typescript
import type { VistaData, VistaExtension, VistaImageClone } from 'vistaview';
import type { VistaView } from 'vistaview';

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

Understanding the order of lifecycle events helps build robust extensions:

1. **On Initialization:**
   - `onInitializeImage()` is called for each image element during setup

2. **On Open:**
   - `onOpen()` is called
   - `control()` is called (if provided)
   - `onImageView()` is called for the initial image
   - `onContentChange()` is called when content loads

3. **On Navigation:**
   - `onImageView()` is called with from/to data
   - `onDeactivateUi()` or `onReactivateUi()` may be called based on content type
   - `onContentChange()` is called when new content loads

4. **On Close:**
   - `onClose()` is called
   - Clean up all resources

## Extension Configuration

Extensions can accept configuration parameters:

```typescript
export function myExtension({
  apiKey,
  maxItems = 10,
  onError,
}: {
  apiKey: string;
  maxItems?: number;
  onError?: (error: Error) => void;
}): VistaExtension {
  return {
    name: 'myExtension',
    // Use configuration
  };
}
```

## Testing Extensions

Test your extension with different scenarios:

```typescript
// Test with minimal config
vistaView({
  elements: '#gallery a',
  extensions: [myExtension()],
});

// Test with controls placement
vistaView({
  elements: '#gallery a',
  controls: {
    topRight: [myExtension()],
  },
});

// Test cleanup on close
const viewer = vistaView({ elements: '#gallery a' });
viewer.open(0);
viewer.close(); // Should clean up properly
```

## Publishing Your Extension

When publishing your extension:

1. Export as a function that returns `VistaExtension`
2. Include TypeScript type definitions
3. Document configuration options
4. Provide usage examples
5. Include CSS if needed
6. List VistaView as a peer dependency

```json
{
  "name": "vistaview-extension-example",
  "peerDependencies": {
    "vistaview": "^0.8.0"
  }
}
```

## Examples Repository

Check the official extensions for more examples:

- **download** - Simple UI button with click handler
- **logger** - Behavior-only extension for debugging
- **image-story** - Complex extension with async data loading and caching

All source code is available in the `src/lib/extensions/` directory of the VistaView repository.
