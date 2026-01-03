---
title: Complex Extensions
description: Build extensions that combine UI, state, and async operations
---

Complex extensions combine multiple features: UI controls, state management, async operations, and external dependencies. They demonstrate advanced extension patterns.

## Image Story Extension

Display dynamic stories with each image:

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

  const cleanCache = () => {
    const keys = Object.keys(storyCache);
    if (keys.length > maxStoryCache) {
      const toRemove = keys.slice(0, keys.length - maxStoryCache);
      toRemove.forEach((key) => delete storyCache[key]);
    }
  };

  return {
    name: 'imageStory',
    description: 'Display stories with images',

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
      storyButton.setAttribute('aria-label', 'Toggle story');

      storyButton.addEventListener('click', () => {
        storyText?.classList.toggle('expanded');
        storyButton.classList.toggle('expanded');
        storyButton.innerHTML = storyButton.classList.contains('expanded') ? '▼' : '▲';
      });

      storyContainer.appendChild(storyText);
      storyContainer.appendChild(storyButton);
      container.appendChild(storyContainer);

      return container;
    },

    onClose: (_v: VistaView) => {
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

      // Unload previous story
      if (currentIndex !== '' && `${index}` !== currentIndex) {
        storyCache[currentIndex]?.onUnload?.();
      }

      currentIndex = `${index}`;

      // Check cache first
      if (`${index}` in storyCache) {
        const story = storyCache[`${index}`];
        if (storyText) storyText.innerHTML = story.content || '';
        story.onLoad?.();
        return;
      }

      // Show loading state
      if (storyText) {
        storyText.innerHTML = '<div class="vvw-story-loading">Loading story...</div>';
      }

      try {
        // Fetch story
        const story = await getStory(index);

        // Sanitize content
        story.content = DOMPurify.sanitize(story.content);

        // Cache it
        storyCache[`${index}`] = story;
        cleanCache();

        // Display if still on same image
        if (currentIndex === `${index}` && storyText) {
          storyText.innerHTML = story.content || '';
          story.onLoad?.();
        }
      } catch (error) {
        console.error('Failed to load story:', error);
        if (storyText) {
          storyText.innerHTML = '<div class="vvw-story-error">Failed to load story</div>';
        }
      }
    },
  };
}
```

CSS for image story:

```css
.vvw-story {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}

.vvw-story-container {
  background: var(--vvw-ui-bg-color);
  backdrop-filter: blur(10px);
  padding: 16px;
  max-height: 30vh;
  overflow: hidden;
  transition: max-height 300ms ease;
}

.vvw-story-text {
  max-height: 60px;
  overflow: hidden;
  transition: max-height 300ms ease;
  color: var(--vvw-ui-text-color);
}

.vvw-story-text.expanded {
  max-height: 25vh;
  overflow-y: auto;
}

.vvw-story-button {
  position: absolute;
  top: 8px;
  right: 16px;
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border: none;
  padding: 4px 12px;
  border-radius: var(--vvw-ui-border-radius);
  cursor: pointer;
}

.vvw-story-loading,
.vvw-story-error {
  opacity: 0.7;
  font-style: italic;
}
```

Usage:

```typescript
vistaView({
  elements: '#gallery a',
  extensions: [
    imageStory({
      getStory: async (index) => {
        const response = await fetch(`/api/stories/${index}`);
        const data = await response.json();

        return {
          content: data.story,
          onLoad: () => console.log('Story loaded'),
          onUnload: () => console.log('Story unloaded'),
        };
      },
      maxStoryCache: 10,
    }),
  ],
});
```

## Social Share Extension

Share images with multiple platforms:

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

const shareIcon = `<svg viewBox="0 0 24 24" width="20" height="20">
  <path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM18 20a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
  <path d="m8.59 13.51 6.83 3.98m-.01-10.98-6.82 3.98"/>
</svg>`;

export function socialShare(): VistaExtension {
  let currentImage: string | null = null;
  let currentTitle: string | null = null;
  let button: HTMLButtonElement | null = null;
  let menu: HTMLDivElement | null = null;

  const share = (platform: string) => {
    if (!currentImage) return;

    const url = encodeURIComponent(window.location.href);
    const image = encodeURIComponent(currentImage);
    const title = encodeURIComponent(currentTitle || 'Check out this image');

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${url}&media=${image}&description=${title}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };

    const shareUrl = shareUrls[platform as keyof typeof shareUrls];
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const createMenu = () => {
    menu = document.createElement('div');
    menu.className = 'vvw-share-menu';
    menu.style.cssText = `
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 8px;
      background: var(--vvw-ui-bg-color);
      border-radius: var(--vvw-ui-border-radius);
      padding: 8px;
      display: none;
      flex-direction: column;
      gap: 8px;
      min-width: 150px;
      z-index: 1000;
    `;

    const platforms = [
      { name: 'Twitter', id: 'twitter' },
      { name: 'Facebook', id: 'facebook' },
      { name: 'Pinterest', id: 'pinterest' },
      { name: 'LinkedIn', id: 'linkedin' },
    ];

    platforms.forEach(({ name, id }) => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.style.cssText = `
        background: var(--vvw-ui-hover-bg-color);
        color: var(--vvw-ui-text-color);
        border: none;
        padding: 8px;
        border-radius: var(--vvw-ui-border-radius);
        cursor: pointer;
        text-align: left;
      `;
      btn.addEventListener('click', () => {
        share(id);
        menu!.style.display = 'none';
      });
      menu.appendChild(btn);
    });

    return menu;
  };

  return {
    name: 'socialShare',
    description: 'Share images on social media',

    control: () => {
      button = document.createElement('button');
      button.setAttribute('aria-label', 'Share');
      button.innerHTML = shareIcon;
      button.style.position = 'relative';

      const shareMenu = createMenu();
      button.appendChild(shareMenu);

      button.addEventListener('click', (e) => {
        e.stopPropagation();
        menu!.style.display = menu!.style.display === 'flex' ? 'none' : 'flex';
      });

      // Close menu when clicking outside
      document.addEventListener('click', () => {
        if (menu) menu.style.display = 'none';
      });

      return button;
    },

    onImageView: (vistaData: VistaData, _v: VistaView) => {
      const centerImage = vistaData.images.to?.[Math.floor(vistaData.images.to.length / 2)];
      if (centerImage) {
        currentImage = centerImage.image;
        currentTitle = centerImage.config.alt || null;
      }
    },

    onClose: () => {
      button?.remove();
      button = null;
      menu = null;
      currentImage = null;
      currentTitle = null;
    },
  };
}
```

## Image Annotations Extension

Add interactive annotations to images:

```typescript
import type { VistaData, VistaExtension, VistaView } from 'vistaview';

type Annotation = {
  x: number; // percentage
  y: number; // percentage
  text: string;
};

export function annotations({
  getAnnotations,
}: {
  getAnnotations: (imageIndex: number) => Promise<Annotation[]>;
}): VistaExtension {
  let markers: HTMLDivElement[] = [];
  let container: HTMLDivElement | null = null;

  const createMarker = (annotation: Annotation) => {
    const marker = document.createElement('div');
    marker.className = 'vvw-annotation-marker';
    marker.style.cssText = `
      position: absolute;
      left: ${annotation.x}%;
      top: ${annotation.y}%;
      width: 24px;
      height: 24px;
      background: var(--vvw-ui-active-bg-color);
      border-radius: 50%;
      cursor: pointer;
      transform: translate(-50%, -50%);
      transition: transform 200ms ease;
    `;

    const tooltip = document.createElement('div');
    tooltip.className = 'vvw-annotation-tooltip';
    tooltip.textContent = annotation.text;
    tooltip.style.cssText = `
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: var(--vvw-ui-bg-color);
      color: var(--vvw-ui-text-color);
      padding: 8px 12px;
      border-radius: var(--vvw-ui-border-radius);
      white-space: nowrap;
      margin-bottom: 8px;
      display: none;
      z-index: 1000;
    `;

    marker.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
      marker.style.transform = 'translate(-50%, -50%) scale(1.2)';
    });

    marker.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
      marker.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    marker.appendChild(tooltip);
    return marker;
  };

  return {
    name: 'annotations',
    description: 'Display image annotations',

    onOpen: (vistaView: VistaView) => {
      container = document.createElement('div');
      container.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      `;
      container.style.pointerEvents = 'none';

      const imgContainer = vistaView.imageContainer;
      if (imgContainer) {
        container.style.pointerEvents = 'auto';
        imgContainer.appendChild(container);
      }
    },

    onImageView: async (vistaData: VistaData, _v: VistaView) => {
      // Clear previous markers
      markers.forEach((m) => m.remove());
      markers = [];

      const index = vistaData.index.to ?? -1;

      try {
        const annotations = await getAnnotations(index);

        annotations.forEach((annotation) => {
          const marker = createMarker(annotation);
          container?.appendChild(marker);
          markers.push(marker);
        });
      } catch (error) {
        console.error('Failed to load annotations:', error);
      }
    },

    onClose: () => {
      markers.forEach((m) => m.remove());
      markers = [];
      container?.remove();
      container = null;
    },
  };
}
```

## Key Patterns

### State Management

```typescript
export function complexExtension(): VistaExtension {
  // Persistent state across lifecycle
  let cache = new Map();
  let currentData: any = null;
  let uiElements: HTMLElement[] = [];

  return {
    name: 'complex',
    // Use state throughout hooks
  };
}
```

### Async Operations with Cleanup

```typescript
onImageView: async (data) => {
  const controller = new AbortController();

  // Store controller for cleanup
  currentController = controller;

  try {
    const result = await fetch(url, {
      signal: controller.signal
    });

    if (controller.signal.aborted) return;

    // Process result
  } catch (error) {
    if (error.name === 'AbortError') return;
    console.error(error);
  }
},

onClose: () => {
  currentController?.abort();
}
```

### External Dependencies

```typescript
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

export function richContent(): VistaExtension {
  return {
    name: 'richContent',
    onImageView: async (data) => {
      const raw = await fetchContent();
      const html = marked(raw);
      const clean = DOMPurify.sanitize(html);
      // Use cleaned content
    },
  };
}
```

### Memory Management

```typescript
const cleanCache = (cache: Map<string, any>, maxSize: number) => {
  if (cache.size > maxSize) {
    const keysToDelete = Array.from(cache.keys()).slice(0, cache.size - maxSize);
    keysToDelete.forEach((key) => cache.delete(key));
  }
};
```

## Next Steps

- [Best Practices](/extensions/authoring/best-practices)
- [Publishing](/extensions/authoring/publishing)
- [Built-in Extensions](/extensions/overview)
