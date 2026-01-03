---
title: VistaPointers Class
description: Multi-pointer tracking system for touch and mouse interactions
---

The `VistaPointers` class provides a unified interface for tracking mouse and touch pointer events. It normalizes pointer data across different input types and manages multi-touch gestures.

## Overview

`VistaPointers` handles:

- Mouse, touch, and pen input tracking
- Multi-pointer gestures (pinch, pan)
- Pointer movement calculations
- Event normalization across input types

**Use Case:** Primarily used internally by [VistaView](/api-reference/vistaview) for handling interactions. Extensions can access pointer data through event listeners.

## Public Properties

None - all properties are private.

## Public Methods

### constructor()

```typescript
constructor(args: VistaPointerArgs)
```

Creates a new pointer tracking system.

**Parameters:**

- `args.elm` - Element to attach listeners to (defaults to `document`)
- `args.listeners` - Array of [pointer listeners](/api-reference/types#vistapointereventargs)

**Example:**

```typescript
import { VistaPointers } from 'vistaview';

const pointers = new VistaPointers({
  elm: element,
  listeners: [
    (e) => {
      console.log('Pointer event:', e.event, e.pointers.length);
    },
  ],
});
```

### startListeners()

```typescript
startListeners(): void
```

Starts listening to pointer events. Called automatically by constructor.

### removeListeners()

```typescript
removeListeners(): void
```

Removes all pointer event listeners. Call this when cleaning up.

**Example:**

```typescript
pointers.removeListeners();
```

### addEventListener()

```typescript
addEventListener(listener: VistaPointerListener): void
```

Adds a pointer event listener.

**Example:**

```typescript
pointers.addEventListener((e) => {
  if (e.event === 'down') {
    console.log('Pointer down at:', e.pointer.x, e.pointer.y);
  }
});
```

### removeEventListener()

```typescript
removeEventListener(listener: VistaPointerListener): void
```

Removes a specific pointer event listener.

### getPointerDistance()

```typescript
getPointerDistance(p1: VistaPointer, p2: VistaPointer): number
```

Calculates the distance between two pointers. Useful for pinch-to-zoom gestures.

**Parameters:**

- `p1` - First [pointer](/api-reference/types#vistapointer)
- `p2` - Second [pointer](/api-reference/types#vistapointer)

**Returns:** Distance in pixels

**Example:**

```typescript
if (pointers.length >= 2) {
  const distance = pointers.getPointerDistance(pointers[0], pointers[1]);
  console.log('Pinch distance:', distance);
}
```

### getCentroid()

```typescript
getCentroid(): { x: number; y: number } | null
```

Calculates the center point of all active pointers. Returns `null` if no pointers are active.

**Returns:** Center coordinates or `null`

**Example:**

```typescript
const center = pointers.getCentroid();
if (center) {
  console.log('Center point:', center.x, center.y);
}
```

## Related

- [VistaPointer](/api-reference/types#vistapointer) - Pointer data type
- [VistaPointerListener](/api-reference/types#vistapointerlistener) - Listener function type
- [VistaExternalPointerListenerArgs](/api-reference/types#vistaexternalpointerlistenerargs) - Event arguments
