---
title: Zoom Options
description: Configure zoom behavior in VistaView
---

## maxZoomLevel

Maximum zoom level allowed:

```typescript
vistaView({
  elements: '#gallery a',
  maxZoomLevel: 3, // Allow 300% zoom (default: 2 = 200%)
});
```

**Note:** VistaView respects the actual image resolution. If an image is 1000px wide and the viewport is 500px, the maximum practical zoom is 2x (100% of actual size).
