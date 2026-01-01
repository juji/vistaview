---
title: Preloading
description: Configure image preloading for better navigation performance
---

## preloads

Number of adjacent images to preload:

```typescript
vistaView({
  elements: '#gallery a',
  preloads: 2, // Preload 2 images on each side (default: 1)
});
```

This improves navigation speed but uses more bandwidth. Set to `0` to disable preloading.
