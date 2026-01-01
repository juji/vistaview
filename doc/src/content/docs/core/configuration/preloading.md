---
title: Preloading
description: Configure image preloading for better navigation performance
---

## preloads

Number of adjacent images to preload:

```typescript
vistaView({
  elements: '#gallery a',
  preloads: 1, // default
});
```

**How it works:**

- Preloads adjacent images on both sides (previous and next)
- `preloads: 1` → loads 3 images total (current + 1 before + 1 after)
- `preloads: 2` → loads 5 images total (current + 2 before + 2 after)
- `preloads: 0` → only loads current image (saves bandwidth but causes loading delays)

**Trade-offs:**

- Higher values: Faster navigation, smoother experience, more bandwidth usage
- Lower values: Less bandwidth, but visible loading delays when navigating
