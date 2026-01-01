---
title: Control Configuration
description: Configure UI controls placement and behavior
---

## Built-in Controls

VistaView includes these built-in controls:

| Control        | Description                               |
| -------------- | ----------------------------------------- |
| `indexDisplay` | Shows current image index (e.g., "1 / 5") |
| `zoomIn`       | Zoom into the image                       |
| `zoomOut`      | Zoom out of the image                     |
| `close`        | Close the lightbox                        |
| `description`  | Shows the image alt text                  |

## Control Placement

```typescript
vistaView({
  elements: '#gallery a',
  controls: {
    topLeft: ['indexDisplay'],
    topRight: ['zoomIn', 'zoomOut', 'close'],
    bottomLeft: ['description'],
    bottomRight: [],
    bottomCenter: [],
  },
});
```

## Adding Extension Controls

Extensions can add custom controls:

```typescript
import { download } from 'vistaview/extensions/download';

vistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'], // Add 'download'
  },
  extensions: [download()], // Register extension
});
```
