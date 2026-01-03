---
title: VistaHiresTransition Class
description: High-resolution image transition manager
---

The `VistaHiresTransition` class manages smooth animated transitions when images are loaded or when dimensions/positions change.

## Overview

`VistaHiresTransition` provides:

- Smooth easing animations for size and position changes
- Concurrent animation management
- Frame-by-frame state interpolation
- Animation cancellation

**Use Case:** Used internally by [VistaImage](/api-reference/vistaimage) to animate dimension and transform changes. Typically not used directly by applications.

## Public Properties

None - all properties and map are private/static.

## Public Static Methods

### start()

```typescript
static start(options: {
  vistaImage: VistaBox;
  onComplete: () => void;
  shouldWait: () => boolean;
  target: {
    width?: number;
    height?: number;
    transform?: { x?: number; y?: number; scale?: number };
    translate?: { x?: number; y?: number };
  };
}): void
```

Starts an animated transition for a VistaBox instance.

**Parameters:**

- `vistaImage` - The [VistaBox](/api-reference/vistabox) instance to animate
- `onComplete` - Callback when animation completes
- `shouldWait` - Function returning `true` to pause animation
- `target` - Target dimensions and transformations to animate to

**Example:**

```typescript
import { VistaHiresTransition } from 'vistaview';

VistaHiresTransition.start({
  vistaImage: image,
  onComplete: () => console.log('Animation complete'),
  shouldWait: () => false,
  target: {
    width: 800,
    height: 600,
    transform: { scale: 1.5, x: 0, y: 0 },
  },
});
```

### stop()

```typescript
static stop(vistaImage: VistaBox): VistaHiresTransitionOpt | undefined
```

Stops an active animation for a VistaBox instance.

**Parameters:**

- `vistaImage` - The [VistaBox](/api-reference/vistabox) instance

**Returns:** The animation state at the time of stopping, or `undefined` if no animation was running

**Example:**

```typescript
const state = VistaHiresTransition.stop(image);
if (state) {
  console.log('Stopped at:', state.current);
}
```

## Animation Behavior

- Uses **easing function** (20% of remaining distance per frame) for smooth motion
- Stops when values are within threshold (1px for position, 0.005 for scale)
- Handles multiple concurrent animations per instance
- Respects `shouldWait` callback to pause during rapid navigation

## Related

- [VistaBox](/api-reference/vistabox) - Container class that uses transitions
- [VistaImage](/api-reference/vistaimage) - Image class that triggers transitions
- [VistaView](/api-reference/vistaview) - Main controller
