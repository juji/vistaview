---
title: VistaImageEvent Class
description: Event handling system for pointer interactions
---

The `VistaImageEvent` class manages pointer events and translates them into image manipulation actions like zooming, panning, and navigation.

## Overview

`VistaImageEvent` coordinates:

- Single and multi-touch gestures
- Pinch-to-zoom detection
- Pan/drag interactions when zoomed
- Momentum scrolling
- External pointer event listeners

**Use Case:** Created internally by [VistaView](/api-reference/classes/vistaview). Extensions can register listeners through [`registerPointerListener()`](/api-reference/classes/vistaview#registerpointerlistener).

## Public Properties

None - all properties are private.

## Public Methods

### constructor()

```typescript
constructor(vvw: VistaView)
```

Creates a new event handling system for a [VistaView](/api-reference/classes/vistaview) instance.

### registerPointerListener()

```typescript
registerPointerListener(listener: (e: VistaExternalPointerListenerArgs) => void): void
```

Registers an external pointer event listener. Same as calling [`viewer.registerPointerListener()`](/api-reference/classes/vistaview#registerpointerlistener).

**Parameters:**

- `listener` - Function receiving [pointer event data](/api-reference/types#vistaexternalpointerlistenerargs)

**Example:**

```typescript
const eventSystem = new VistaImageEvent(viewer);

eventSystem.registerPointerListener((e) => {
  console.log('Event:', e.event);
  console.log('Pointers:', e.pointers.length);
  console.log('State:', e.state.zoomedIn);
});
```

### start()

```typescript
start(imageContainer: HTMLElement): void
```

Starts listening to pointer events on the specified container. Called automatically by [VistaView](/api-reference/classes/vistaview) when opening.

**Parameters:**

- `imageContainer` - The element to attach event listeners to

### stop()

```typescript
stop(): void
```

Removes all event listeners and cleans up resources. Called automatically by [VistaView](/api-reference/classes/vistaview) when closing.

## Related

- [VistaView](/api-reference/classes/vistaview) - Main controller that uses VistaImageEvent
- [VistaPointers](/api-reference/classes/vistapointers) - Underlying pointer tracking system
- [VistaExternalPointerListenerArgs](/api-reference/types#vistaexternalpointerlistenerargs) - Event data type
