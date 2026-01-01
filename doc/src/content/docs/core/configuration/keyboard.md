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
