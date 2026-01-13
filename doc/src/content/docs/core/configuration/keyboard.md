---
title: Keyboard & Touch Navigation
description: Configure keyboard shortcuts and touch gestures for desktop and mobile users
---

## Keyboard Navigation

VistaView includes **built-in keyboard navigation** that's enabled by default.

### Keyboard Shortcuts

When the lightbox is open, the following keyboard shortcuts are available:

- **Arrow Left** (←) - Navigate to previous image
- **Arrow Right** (→) - Navigate to next image
- **Arrow Up** (↑) - Zoom in
- **Arrow Down** (↓) - Zoom out
- **Escape** (Esc) - Close lightbox

### Configuration

Control keyboard navigation via the `keyboardListeners` option:

```typescript
vistaView({
  elements: '#gallery a',
  keyboardListeners: true, // Default: enabled
});
```

To disable keyboard navigation:

```typescript
vistaView({
  elements: '#gallery a',
  keyboardListeners: false,
});
```

## Touch Gestures

VistaView automatically handles touch gestures with **no configuration needed**. All gestures work out-of-the-box on mobile devices.

### Pinch-to-Zoom

Use two fingers to zoom in and out:

- **Two-finger pinch out** - Zoom in
- **Two-finger pinch in** - Zoom out

The zoom is centered around the touch point (centroid of your fingers) for intuitive interaction. VistaView includes a cooldown period (111ms) after pinch gestures to prevent conflicts with other touch interactions.

### Swipe Navigation

Single-finger swipe gestures for navigation:

- **Horizontal swipe right** (>64px) - Navigate to previous image
- **Horizontal swipe left** (>64px) - Navigate to next image
- **Vertical swipe down** (>144px) - Close lightbox

**Note:** Swipe gestures only work when the image is not zoomed in. When zoomed, single-finger drag is used for panning.

### Pan/Drag

When an image is zoomed in:

- **Single finger drag** - Pan around the zoomed image

Pan is disabled at normal zoom level to allow swipe gestures for navigation and closing.

### Scroll-to-Zoom

On devices with a mouse or trackpad:

- **Scroll wheel** - Zoom in/out around cursor position

## Mobile-Specific Options

### arrowOnSmallScreens

Control whether navigation arrows are shown on mobile devices:

```typescript
vistaView({
  elements: '#gallery a',
  arrowOnSmallScreens: true, // Show arrows on screens < 768px (default: false)
});
```

By default, navigation arrows are hidden on screens smaller than 768px to provide a cleaner interface where users can swipe. Enable this option if you want to show arrow buttons on mobile devices.

## Advanced: Custom Touch Handling

For custom touch behaviors and gesture tracking, use the `registerPointerListener()` method:

```typescript
const vista = vistaView({ elements: '#gallery a' });

vista.registerPointerListener((e) => {
  // Track pointer events
  console.log('Event type:', e.event); // 'down' | 'move' | 'up' | 'cancel'
  console.log('Active pointers:', e.pointers.length);
  console.log('Pointer position:', e.pointer.x, e.pointer.y);
  console.log('Zoom/pinch active:', e.hasInternalExecution);

  // Access current state
  console.log('Is zoomed:', e.state.zoomedIn);
  console.log('Current index:', e.state.currentIndex);
});
```

### VistaExternalPointerListenerArgs Properties

- `event` - Event type: `'down'`, `'move'`, `'up'`, or `'cancel'`
- `pointer` - Current pointer data (x, y, movementX, movementY, id)
- `pointers` - Array of all active touch points/pointers
- `lastPointerLen` - Previous number of active pointers
- `state` - Current [VistaState](/api-reference/classes/vistastate) instance
- `hasInternalExecution` - `true` when VistaView is handling the gesture (zoom/pinch)
- `abortController` - Controller to abort ongoing animations

### Example: Custom Gesture Detection

```typescript
vista.registerPointerListener((e) => {
  // Skip if VistaView is handling the event (zooming/pinching)
  if (e.hasInternalExecution) return;

  // Detect three-finger tap
  if (e.event === 'down' && e.pointers.length === 3) {
    console.log('Three-finger tap detected!');
    // Custom action here
  }

  // Track swipe velocity
  if (e.event === 'move' && e.pointers.length === 1) {
    const velocity = Math.sqrt(e.pointer.movementX ** 2 + e.pointer.movementY ** 2);
    console.log('Swipe velocity:', velocity);
  }
});
```

## Customizing Swipe Behavior

The default swipe gesture behavior is implemented in VistaView's `initFunction` lifecycle hook. You can extend or replace this behavior:

```typescript
import { init as defaultInit } from 'vistaview/defaults/init';

vistaView({
  elements: '#gallery a',
  initFunction: (vistaView) => {
    // Call default behavior (sets up swipe gestures)
    defaultInit(vistaView);

    // Add your custom initialization
    vistaView.registerPointerListener((e) => {
      // Your custom gesture handling
      if (e.event === 'down' && e.pointers.length === 3) {
        console.log('Three-finger tap!');
      }
    });
  },
});
```

**Default initFunction behavior:**

- Registers a pointer listener for single-touch swipe gestures
- Vertical swipe down (>144px) closes the lightbox
- Horizontal swipe left/right (>64px) navigates between images
- Provides visual feedback during swipe (translates the image container)

To completely replace the default swipe behavior, provide your own `initFunction` without calling `defaultInit()`.

See [Lifecycle Functions](/core/configuration/lifecycle) for more details on customizing behavior.

## Related

- [VistaPointers API](/api-reference/classes/vistapointers) - Low-level pointer tracking
- [registerPointerListener()](/api-reference/classes/vistaview#registerpointerlistener) - Method documentation
- [VistaState](/api-reference/classes/vistastate) - State management
- [Lifecycle Functions](/core/configuration/lifecycle) - Custom behavior overrides
