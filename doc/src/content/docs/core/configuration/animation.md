---
title: Animation Options
description: Configure animation timing and behavior in VistaView
---

## animationDurationBase

Base multiplier for all animation timings in VistaView. This unitless value is multiplied to create different animation durations throughout the lightbox.

**How it works:**

- The base value is multiplied by `1ms`, `2ms`, etc. to create proportional timings
- Primary animations (open, close, transitions): `333ms` (1× base)
- Delays and sequential animations: `666ms` (2× base)
- Changing this value scales all animations proportionally, maintaining timing relationships

**Default:** `333`

```typescript
vistaView({
  elements: '#gallery a',
  animationDurationBase: 333, // default
});
```

## rapidLimit

Defines the time threshold (in milliseconds) for detecting rapid navigation. When users navigate faster than this limit, VistaView skips transition animations for better performance.

**How it works:**

- If the time between image swaps is **less than** `rapidLimit`, it's considered a "rapid swap"
- During rapid swaps, transition animations are skipped and images swap instantly
- After rapid navigation stops, there's a 333ms cooldown before normal transitions resume
- This prevents stuttering when users rapidly click next/prev or hold down arrow keys

**Default:** `222` (222ms)

```typescript
vistaView({
  elements: '#gallery a',
  rapidLimit: 222, // default
});
```
