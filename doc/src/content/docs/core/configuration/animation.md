---
title: Animation Options
description: Configure animation timing and behavior in VistaView
---

## animationDurationBase

Controls the base duration of all animations (open, close, transitions):

```typescript
vistaView({
  elements: '#gallery a',
  animationDurationBase: 500, // Slower animations (default: 333ms)
});
```

## rapidLimit

Prevents too-fast interactions (useful for touch devices):

```typescript
vistaView({
  elements: '#gallery a',
  rapidLimit: 300, // Minimum 300ms between actions (default: 222ms)
});
```
