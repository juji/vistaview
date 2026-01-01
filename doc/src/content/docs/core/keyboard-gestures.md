---
title: Keyboard & Gestures
description: Keyboard shortcuts and touch gestures in VistaView
---

VistaView provides comprehensive keyboard navigation and touch gesture support for an intuitive user experience.

## Keyboard Navigation

### Default Shortcuts

| Key             | Action                     |
| --------------- | -------------------------- |
| `←` Left Arrow  | Navigate to previous image |
| `→` Right Arrow | Navigate to next image     |
| `↑` Up Arrow    | Zoom in                    |
| `↓` Down Arrow  | Zoom out                   |
| `Esc` Escape    | Close lightbox             |

### Disabling Keyboard Controls

You can disable keyboard navigation globally:

```typescript
vistaView({
  elements: '#gallery a',
  keyboardListeners: false, // Disable all keyboard controls
});
```

### Custom Keyboard Handlers

For custom keyboard behavior, you can add your own event listeners:

```typescript
const gallery = vistaView({
  elements: '#gallery a',
  onOpen: () => {
    document.addEventListener('keydown', handleCustomKeys);
  },
  onClose: () => {
    document.removeEventListener('keydown', handleCustomKeys);
  },
});

function handleCustomKeys(e: KeyboardEvent) {
  switch (e.key) {
    case 'Home':
      gallery.view(0); // Go to first image
      break;
    case 'End':
      gallery.view(gallery.getCurrentIndex()); // Go to last
      break;
    case 'PageUp':
      gallery.prev();
      break;
    case 'PageDown':
      gallery.next();
      break;
  }
}
```

## Touch Gestures

VistaView is touch-first and provides intuitive gesture controls.

### Supported Gestures

| Gesture                | Action                        |
| ---------------------- | ----------------------------- |
| **Swipe Left**         | Navigate to next image        |
| **Swipe Right**        | Navigate to previous image    |
| **Swipe Up**           | Close lightbox                |
| **Swipe Down**         | Close lightbox                |
| **Pinch In**           | Zoom out                      |
| **Pinch Out**          | Zoom in                       |
| **Single Tap**         | Toggle UI controls visibility |
| **Double Tap**         | Zoom in/out to fit            |
| **Drag (when zoomed)** | Pan around the image          |

### Advanced Touch Features

#### Momentum Physics

When panning a zoomed image, VistaView applies momentum physics:

- **Drag velocity** is tracked during touch movement
- **Inertial scrolling** continues after release
- **Bounce-back** when reaching image edges
- **Smooth deceleration** with easing

#### Multi-Touch Support

VistaView supports multiple simultaneous touch points:

- **Two-finger pinch** for precise zoom control
- **Two-finger drag** for smooth panning
- **Rotation** (if extended via custom extension)

#### Context Menu Prevention

VistaView prevents the context menu on long-press:

- Allows smooth drag gestures on touch devices
- Prevents accidental menu popups during interactions
- Works across iOS, Android, and touch-enabled desktops

### Swipe Threshold

Swipes need to meet minimum thresholds to trigger actions:

- **Horizontal swipes:** 50px minimum distance for next/prev
- **Vertical swipes:** 100px minimum distance for close
- **Velocity threshold:** Faster swipes have lower distance requirements

This prevents accidental navigation during normal panning.

## Mouse Controls

### Navigation

- **Click left edge** - Previous image (on desktop, if arrows visible)
- **Click right edge** - Next image (on desktop, if arrows visible)
- **Click outside image** - Close lightbox
- **Scroll wheel** - Zoom in/out

### Drag to Pan

When an image is zoomed:

1. **Click and hold** on the image
2. **Drag** to pan around
3. **Release** - momentum continues the pan

### Zoom Controls

- **Zoom buttons** - Click UI zoom in/out buttons
- **Scroll wheel** - Zoom in/out at cursor position
- **Double-click** - Toggle zoom to fit/zoom in

## Mobile Optimization

### Arrow Visibility on Small Screens

By default, navigation arrows are hidden on screens smaller than 768px. You can override this:

```typescript
vistaView({
  elements: '#gallery a',
  arrowOnSmallScreens: true, // Show arrows on mobile
});
```

### Touch Target Sizes

VistaView ensures touch targets meet accessibility standards:

- **Minimum size:** 44×44px for all interactive elements
- **Proper spacing:** Adequate spacing between controls
- **Enlarged tap zones:** Forgiving hit areas for small controls

### Performance

- **Hardware acceleration** - CSS transforms for smooth animations
- **Passive event listeners** - Improves scroll performance
- **Throttled updates** - Reduces processing during rapid gestures
- **Will-change hints** - Optimizes rendering pipeline

## Accessibility

### Reduced Motion

VistaView respects the `prefers-reduced-motion` user preference:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations are automatically reduced */
}
```

This affects:

- Opening/closing animations
- Transitions between images
- Zoom animations
- Pan momentum

### Screen Reader Support

Keyboard navigation announcements:

- **Arrow keys** - Announces image number and total
- **Zoom** - Announces zoom level changes
- **Open/close** - Announces lightbox state

### Focus Management

- **Focus trap** - Focus stays within lightbox when open
- **Return focus** - Returns to trigger element on close
- **Visible focus** - Clear focus indicators on all controls

## Rapid Action Limiting

To prevent too-fast interactions that could cause issues:

```typescript
vistaView({
  elements: '#gallery a',
  rapidLimit: 222, // Minimum 222ms between actions (default)
});
```

This prevents:

- Accidental double-taps
- Rapid key presses causing lag
- Race conditions during animations

Increase the value for slower devices or to be more conservative:

```typescript
vistaView({
  elements: '#gallery a',
  rapidLimit: 500, // Slower, more conservative
});
```

## Pointer Tracking

VistaView uses an advanced pointer tracking system that:

- **Unifies** mouse, touch, and pen input
- **Tracks multiple** simultaneous pointers
- **Calculates velocity** for momentum physics
- **Prevents conflicts** between different input types

### Pointer Priority

When multiple input types are active:

1. **Touch** takes priority over mouse
2. **Pen** is treated like touch
3. **Mouse** is ignored when touch is active

This prevents conflicts when using hybrid devices.

## Custom Gesture Handling

For advanced use cases, you can access the pointer system:

```typescript
import { VistaPointers } from 'vistaview';

const pointers = new VistaPointers({
  elm: myElement,
  onUpdate: (pointers) => {
    console.log('Active pointers:', pointers.length);
    console.log('Average position:', {
      x: pointers.reduce((sum, p) => sum + p.x, 0) / pointers.length,
      y: pointers.reduce((sum, p) => sum + p.y, 0) / pointers.length,
    });
  },
  onEnd: (pointers) => {
    console.log('Gesture ended');
  },
});
```

## Best Practices

### Mobile-First Design

Design for touch first, then enhance for desktop:

```typescript
vistaView({
  elements: '#gallery a',
  arrowOnSmallScreens: false, // Rely on swipe gestures on mobile
  keyboardListeners: true, // Enable keyboard for desktop
});
```

### Provide Visual Feedback

Let users know gestures are available:

- Add swipe indicators on first open
- Show hints for pinch-to-zoom
- Animate controls to show interactivity

### Test on Real Devices

Touch behavior varies across devices:

- Test on iOS and Android
- Test on different screen sizes
- Test with different browsers
- Test with assistive technologies

### Consider Accessibility

Always provide keyboard alternatives to gestures:

- All gestures should have keyboard equivalents
- Don't rely solely on swipe/pinch interactions
- Provide visible UI controls as fallback

## Troubleshooting

### Gestures Not Working

1. **Check for conflicting event listeners** on parent elements
2. **Ensure touch-action CSS** is not preventing gestures
3. **Verify pointer-events** is not set to `none`
4. **Check for scroll-blocking** parent containers

### Performance Issues

1. **Reduce `preloads`** value to decrease memory usage
2. **Increase `rapidLimit`** to throttle interactions
3. **Disable momentum** if experiencing lag
4. **Check image sizes** - large images can cause slowdown

### Keyboard Not Working

1. **Check `keyboardListeners`** option is not disabled
2. **Verify focus** is within the lightbox
3. **Look for conflicting** keyboard handlers
4. **Check browser focus** mode (some browsers have quirks)

## Next Steps

- Learn about [events and lifecycle](/core/events)
- Explore [configuration options](/core/configuration)
- See the [API Reference](/core/api-reference)
