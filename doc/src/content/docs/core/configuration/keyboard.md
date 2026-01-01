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

Set the starting z-index for the lightbox:

```typescript
vistaView({
  elements: '#gallery a',
  initialZIndex: 9999, // Ensure lightbox appears above everything
});
```
