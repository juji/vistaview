---
title: Best Practices
description: Guidelines for creating robust VistaView extensions
---

Follow these best practices to create reliable, performant, and maintainable extensions.

## Memory Management

### Always Clean Up in onClose

```typescript
export function myExtension(): VistaExtension {
  let button: HTMLButtonElement | null = null;
  let intervalId: number | null = null;
  let cache = new Map();

  return {
    name: 'myExtension',

    onClose: () => {
      // Remove event listeners
      button?.removeEventListener('click', handleClick);

      // Remove DOM elements
      button?.remove();
      button = null;

      // Clear timers
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }

      // Clear caches
      cache.clear();

      // Abort ongoing requests
      controller?.abort();
    },
  };
}
```

### Limit Cache Size

```typescript
const MAX_CACHE_SIZE = 10;
let cache = new Map<string, any>();

const addToCache = (key: string, value: any) => {
  cache.set(key, value);

  if (cache.size > MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
};
```

### Use WeakMap for DOM References

```typescript
const elementData = new WeakMap<HTMLElement, any>();

// Automatically garbage collected when element is removed
elementData.set(element, {
  /* data */
});
```

## State Management

### Use Closure Variables

```typescript
export function statefulExtension(): VistaExtension {
  // State persists across all hook calls
  let currentIndex = 0;
  let isActive = false;
  const cache = new Map();

  return {
    name: 'statefulExtension',
    onImageView: (data) => {
      currentIndex = data.index.to ?? 0;
      // Use and modify state
    },
  };
}
```

### Don't Rely on External State

```typescript
// ❌ Bad - relies on external state
let globalState = {};

export function badExtension(): VistaExtension {
  return {
    name: 'bad',
    onOpen: () => {
      globalState.active = true; // Can cause issues with multiple instances
    },
  };
}

// ✅ Good - self-contained state
export function goodExtension(): VistaExtension {
  let localState = { active: false };

  return {
    name: 'good',
    onOpen: () => {
      localState.active = true; // Safe for multiple instances
    },
  };
}
```

## Async Operations

### Handle Abort Signals

```typescript
onImageView: async (data) => {
  const controller = new AbortController();
  currentController = controller;

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    });

    // Check if aborted before processing
    if (controller.signal.aborted) return;

    const result = await response.json();
    // Process result
  } catch (error) {
    if (error.name === 'AbortError') {
      // Silently handle abortion
      return;
    }
    console.error('Request failed:', error);
  }
};
```

### Debounce Rapid Changes

```typescript
let debounceTimer: number | null = null;

onImageView: (data) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    // Process change after 300ms of no changes
    loadContent(data.index.to ?? 0);
  }, 300);
};
```

### Check Current State Before Updating

```typescript
onImageView: async (data) => {
  const targetIndex = data.index.to ?? 0;
  currentRequestIndex = targetIndex;

  const result = await fetchData(targetIndex);

  // Only update if still on same image
  if (currentRequestIndex === targetIndex) {
    updateUI(result);
  }
};
```

## Accessibility

### Add ARIA Labels

```typescript
control: () => {
  const button = document.createElement('button');
  button.setAttribute('aria-label', 'Download image');
  button.setAttribute('role', 'button');
  button.setAttribute('tabindex', '0');
  return button;
};
```

### Support Keyboard Navigation

```typescript
control: () => {
  const button = document.createElement('button');

  button.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      button.click();
    }
  });

  return button;
};
```

### Provide Focus Indicators

```css
.vvw-my-extension button:focus-visible {
  outline: 2px solid var(--vvw-ui-active-bg-color);
  outline-offset: 2px;
}
```

### Announce State Changes

```typescript
const announceToScreenReader = (message: string) => {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.style.cssText = `
    position: absolute;
    left: -10000px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  `;
  announcement.textContent = message;

  document.body.appendChild(announcement);
  setTimeout(() => announcement.remove(), 1000);
};
```

## CSS Styling

### Use CSS Variables

```css
.vvw-my-extension {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border-radius: var(--vvw-ui-border-radius);
}

.vvw-my-extension:hover {
  background: var(--vvw-ui-hover-bg-color);
}

.vvw-my-extension:active {
  background: var(--vvw-ui-active-bg-color);
}
```

### Use vvw- Prefix

```css
/* ✅ Good - namespaced */
.vvw-story-container {
}
.vvw-story-text {
}
.vvw-story-button {
}

/* ❌ Bad - could conflict */
.story-container {
}
.text {
}
.button {
}
```

### Respect Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .vvw-my-extension {
    animation: none;
    transition: none;
  }
}
```

## TypeScript

### Use Proper Types

```typescript
import type { VistaExtension, VistaData, VistaView, VistaImageParams } from 'vistaview';

export function typedExtension(): VistaExtension {
  return {
    name: 'typedExtension',
    onImageView: (data: VistaData, view: VistaView) => {
      // Fully typed parameters
      const index: number = data.index.to ?? 0;
    },
  };
}
```

### Export Factory Functions

```typescript
// ✅ Good - allows configuration
export function myExtension(options?: { color?: string }): VistaExtension {
  return {
    name: 'myExtension',
    // Implementation
  };
}

// ❌ Bad - no configuration possible
export const myExtension: VistaExtension = {
  name: 'myExtension',
  // Implementation
};
```

### Document Configuration

```typescript
export interface MyExtensionOptions {
  /** Maximum number of items to cache */
  maxCache?: number;
  /** Callback when action completes */
  onComplete?: (result: any) => void;
  /** Enable debug logging */
  debug?: boolean;
}

export function myExtension(options: MyExtensionOptions = {}): VistaExtension {
  const { maxCache = 10, onComplete, debug = false } = options;

  return {
    name: 'myExtension',
    // Implementation
  };
}
```

## Error Handling

### Catch and Log Errors

```typescript
onImageView: async (data) => {
  try {
    await loadContent(data.index.to ?? 0);
  } catch (error) {
    console.error('[myExtension] Failed to load content:', error);
    showErrorUI('Failed to load content');
  }
};
```

### Provide Fallbacks

```typescript
onImageView: async (data) => {
  try {
    const content = await fetchContent();
    displayContent(content);
  } catch (error) {
    // Show cached content as fallback
    if (cachedContent) {
      displayContent(cachedContent);
    } else {
      showPlaceholder();
    }
  }
};
```

### Don't Break Other Extensions

```typescript
// ✅ Good - errors are contained
onImageView: (data) => {
  try {
    myRiskyOperation();
  } catch (error) {
    console.error('Extension error:', error);
    // Don't rethrow
  }
};

// ❌ Bad - could break other extensions
onImageView: (data) => {
  myRiskyOperation(); // Uncaught errors bubble up
};
```

## Performance

### Debounce Expensive Operations

```typescript
let debounceTimer: number | null = null;

const expensiveOperation = (index: number) => {
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = window.setTimeout(() => {
    performExpensiveTask(index);
  }, 300);
};
```

### Use RequestAnimationFrame for Animations

```typescript
let rafId: number | null = null;

const animate = () => {
  // Update animation
  rafId = requestAnimationFrame(animate);
};

onOpen: () => {
  animate();
},

onClose: () => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}
```

### Lazy Load Dependencies

```typescript
onImageView: async (data) => {
  // Only load when needed
  const DOMPurify = await import('isomorphic-dompurify');
  const cleaned = DOMPurify.sanitize(content);
};
```

## Testing Considerations

### Make Extensions Testable

```typescript
export function testableExtension({
  fetcher = fetch,
}: {
  fetcher?: typeof fetch;
} = {}): VistaExtension {
  return {
    name: 'testable',
    onImageView: async (data) => {
      // Use injected fetcher for testing
      const result = await fetcher('/api/data');
    },
  };
}
```

### Provide Debug Mode

```typescript
export function debuggableExtension({
  debug = false,
}: {
  debug?: boolean;
} = {}): VistaExtension {
  const log = (...args: any[]) => {
    if (debug) console.log('[myExtension]', ...args);
  };

  return {
    name: 'debuggable',
    onImageView: (data) => {
      log('Image viewed:', data.index.to);
    },
  };
}
```

## Next Steps

- [Publishing Extensions](/extensions/authoring/publishing)
- [UI Extensions Guide](/extensions/authoring/ui-extensions)
- [Content Extensions Guide](/extensions/authoring/content-extensions)
