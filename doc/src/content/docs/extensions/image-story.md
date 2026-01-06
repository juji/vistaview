---
title: Image Story Extension
description: Display rich HTML content alongside images
---

The Image Story extension allows you to display rich HTML content (stories, descriptions, captions) below images in the lightbox. Content is loaded on-demand and cached for performance.

## Installation

### ESM (Module Bundlers)

```javascript
import { vistaView } from 'vistaview';
import { imageStory } from 'vistaview/extensions/image-story';
import 'vistaview/style.css';
import 'vistaview/styles/extensions/image-story.css';

vistaView({
  elements: '#gallery a',
  extensions: [
    imageStory({
      getStory: async (index) => {
        const response = await fetch(`/api/stories/${index}`);
        const data = await response.json();
        return { content: data.html };
      },
    }),
  ],
});
```

### UMD (CDN)

```html
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/style.css" />
<link rel="stylesheet" href="https://unpkg.com/vistaview/dist/styles/extensions/image-story.css" />
<script src="https://unpkg.com/vistaview/dist/vistaview.umd.js"></script>
<script src="https://unpkg.com/vistaview/dist/extensions/image-story.umd.js"></script>

<script>
  VistaView.vistaView({
    elements: '#gallery a',
    extensions: [
      VistaView.imageStory({
        getStory: async (index) => {
          const response = await fetch(`/api/stories/${index}`);
          const data = await response.json();
          return { content: data.html };
        },
      }),
    ],
  });
</script>
```

## Configuration

### getStory (required)

A function that returns a promise resolving to a story object:

```typescript
getStory: (imageIndex: number) => Promise<StoryResult>;
```

**StoryResult interface:**

```typescript
interface StoryResult {
  content: string; // HTML content (will be sanitized)
  onLoad?: () => void; // Called when story is displayed
  onUnload?: () => void; // Called when navigating away
}
```

### maxStoryCache (optional)

Maximum number of stories to keep in memory. Default: `5`

```javascript
imageStory({
  getStory: async (index) => {
    /* ... */
  },
  maxStoryCache: 10, // Keep 10 stories cached
});
```

## Features

- **Rich HTML content** - Display formatted text, images, links, etc.
- **On-demand loading** - Stories are fetched only when needed
- **Smart caching** - Recently viewed stories are cached
- **Auto-sanitization** - HTML is automatically sanitized using DOMPurify
- **Expandable panel** - Users can expand/collapse the story
- **Lifecycle hooks** - onLoad/onUnload for custom behavior

## Usage Examples

### Basic Usage

```javascript
import { imageStory } from 'vistaview/extensions/image-story';

vistaView({
  elements: '#gallery a',
  extensions: [
    imageStory({
      getStory: async (index) => ({
        content: `
          <h2>Image ${index + 1}</h2>
          <p>This is the story for image ${index + 1}.</p>
        `,
      }),
    }),
  ],
});
```

### Fetching from API

```javascript
imageStory({
  getStory: async (index) => {
    try {
      const response = await fetch(`/api/stories/${index}`);
      const data = await response.json();

      return {
        content: `
          <h2>${data.title}</h2>
          <p>${data.description}</p>
          <p><small>By ${data.author} on ${data.date}</small></p>
        `,
      };
    } catch (error) {
      return {
        content: '<p>Story could not be loaded.</p>',
      };
    }
  },
});
```

### With Lifecycle Hooks

```javascript
imageStory({
  getStory: async (index) => {
    const response = await fetch(`/api/stories/${index}`);
    const data = await response.json();

    return {
      content: data.html,
      onLoad: () => {
        console.log(`Story ${index} loaded`);
        // Track analytics
        gtag('event', 'story_view', { story_id: index });
      },
      onUnload: () => {
        console.log(`Story ${index} unloaded`);
        // Cleanup any event listeners
      },
    };
  },
});
```

### With Static Stories

```javascript
const stories = [
  {
    title: 'Sunset at the Beach',
    content: 'A beautiful evening captured at the coast...',
  },
  {
    title: 'Mountain Peak',
    content: 'Hiking adventure to the summit...',
  },
];

imageStory({
  getStory: async (index) => ({
    content: `
      <h2>${stories[index].title}</h2>
      <p>${stories[index].content}</p>
    `,
  }),
});
```

## Styling

The extension includes default styles, but you can customize:

```css
/* Story container */
.vvw-story {
  /* Positioned at bottom of lightbox */
}

/* Story text area */
.vvw-story-text {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  color: white;
  padding: 16px;
  border-radius: 8px;
}

/* Expanded state */
.vvw-story-text.expanded {
  max-height: 400px;
  overflow-y: auto;
}

/* Expand/collapse button */
.vvw-story-button {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  cursor: pointer;
}
```

## Security

The extension automatically sanitizes HTML content using DOMPurify to prevent XSS attacks. However, you should still:

1. **Validate input** on your server
2. **Use Content Security Policy** (CSP) headers
3. **Sanitize user-generated content** before storing

## Performance

### Caching

Stories are cached in memory to avoid redundant API calls:

```javascript
imageStory({
  getStory: async (index) => {
    // This is only called once per image (until cache eviction)
    return await fetchStory(index);
  },
  maxStoryCache: 10, // Adjust based on memory constraints
});
```

### Lazy Loading

Stories are only fetched when the user navigates to an image, not during initialization.

### Cache Eviction

When the cache exceeds `maxStoryCache`, the oldest entries are evicted (FIFO).

## Bundle Size

- **ESM:** 33.60 KB (10.84 KB gzip)
- **UMD:** 25.28 KB (9.81 KB gzip)
- **CSS:** 2.52 KB (0.72 KB gzip)

Note: Includes DOMPurify for HTML sanitization.

## Next Steps

- Learn about [creating custom extensions](/extensions/authoring)
- Explore other [extensions](/extensions/overview)
- See [configuration options](/core/configuration/complete)
