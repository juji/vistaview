---
title: Keyboard & UI Options
description: Configure keyboard navigation and UI behavior
---

## keyboardListeners

Enable/disable keyboard navigation:

```typescript
vistaView({
  elements: '#gallery a',
  keyboardListeners: false, // Disable keyboard controls
});
```

## arrowOnSmallScreens

Show navigation arrows on mobile devices:

```typescript
vistaView({
  elements: '#gallery a',
  arrowOnSmallScreens: true, // Show arrows on screens < 768px
});
```

## initialZIndex

Set the z-index for the lightbox when opening or closing. When active, the lightbox automatically uses the maximum z-index (`2147483647`) to appear above all content.

**Default:** `1`

**Most users should leave this at the default value.**

```typescript
vistaView({
  elements: '#gallery a',
  initialZIndex: 1, // default
});
```

**Why leave it at 1?**

VistaView renders its container at the bottom of the page (end of DOM). With the default `initialZIndex: 1`.
It then brings the image to the center, and raise the z-index to the maximum z-index.
In effect, this requires z-index ordering:

- Your **sticky header** should use `z-index: 2` or higher to appear above the opening/closing lightbox

**Example with sticky header:**

```css
/* Your sticky header */
.site-header {
  position: sticky;
  z-index: 2; /* Appears above closed lightbox (z-index: 1) */
}
```

**How it works:**

- **Closed state:** Uses `initialZIndex` value (default: 1)
- **Active state:** Switches to `2147483647` (max z-index) in the middle of animation - always above everything
- **Closing state:** Transitions back to `initialZIndex` during animation

:::tip
Only change `initialZIndex` if you have z-index stacking context conflicts. For typical sticky headers, just set your header to `z-index: 2` or higher.
:::
