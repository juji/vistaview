---
title: Zoom Options
description: Configure zoom behavior in VistaView
---

## maxZoomLevel

Defines the maximum zoom level as a multiplier of the image's natural dimensions.

**How it works:**

- VistaView maintains three zoom levels:
  - **Minimum (0.5×)**: 50% of fitted size - zooming below this triggers close
  - **Fitted**: Image fitted to viewport while maintaining aspect ratio
  - **Maximum**: Natural image dimensions × `maxZoomLevel`
- Zoom automatically corrects if exceeded:
  - Over maximum → animates back to max
  - Under normal (but not closing) → animates back to fitted size

**Default:** `2` (200% of natural size)

```typescript
vistaView({
  elements: '#gallery a',
  maxZoomLevel: 2, // default - allows zoom to 200% of natural size
});
```

**Example:**
If an image is 1600×1200px and displays at 800×600px to fit the viewport:

- Minimum zoom: 400×300px (50% of fitted)
- Normal zoom: 800×600px (fitted to viewport)
- Maximum zoom: 3200×2400px (200% of natural 1600×1200px)
