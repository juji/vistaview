---
title: TypeScript Support
description: TypeScript types and interfaces for VistaView
---

All configuration options are fully typed:

```typescript
import type { VistaParamsNeo, VistaOpt } from 'vistaview';

const config: VistaParamsNeo = {
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
};
```
