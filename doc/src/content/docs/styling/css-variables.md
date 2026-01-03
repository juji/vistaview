---
title: CSS Variables
description: Customize VistaView appearance with CSS custom properties
---

VistaView uses CSS custom properties (CSS variables) for easy customization without modifying the source code.

## Basic Usage

Import the base CSS file:

```javascript
import 'vistaview/style.css';
```

Then override variables in your own CSS:

```css
/* The following are default values */
:root {
  --vvw-bg-color: #000000;
  --vvw-text-color: #ffffff;

  --vvw-bg-blur: 10px;
  --vvw-bg-opacity: 0.8;

  --vvw-anim-dur: 333;

  --vvw-init-z: 1;
  --vvw-dest-z: 2147483647;

  --vvw-ui-outline-color: hsl(from var(--vvw-bg-color) h s calc(l + 30));
  --vvw-ui-text-color: var(--vvw-text-color);

  --vvw-ui-bg-color: var(--vvw-bg-color);
  --vvw-ui-hover-bg-color: hsl(from var(--vvw-bg-color) h s calc(l + 20));
  --vvw-ui-active-bg-color: hsl(from var(--vvw-bg-color) h s calc(l + 40));

  --vvw-ui-border-radius: 0px;
  --vvw-ui-border-width: 0px;
}
```

## Available Variables

### Core Colors

```css
:root {
  --vvw-bg-color: #000000;
  --vvw-text-color: #ffffff;
  --vvw-bg-blur: 10px;
  --vvw-bg-opacity: 0.8;
}
```

### Animation

```css
:root {
  /* Duration in milliseconds */
  --vvw-anim-dur: 333;
}
```

### Z-Index

```css
:root {
  /* Initial z-index (set via initialZIndex config) */
  --vvw-init-z: 1;

  /* Maximum z-index when lightbox is open */
  --vvw-dest-z: 2147483647;
}
```

### UI Theme Colors

These are derived from the core colors:

```css
:root {
  --vvw-ui-outline-color: hsl(from var(--vvw-bg-color) h s calc(l + 30));
  --vvw-ui-bg-color: var(--vvw-bg-color);
  --vvw-ui-text-color: var(--vvw-text-color);
  --vvw-ui-hover-bg-color: hsl(from var(--vvw-bg-color) h s calc(l + 20));
  --vvw-ui-active-bg-color: hsl(from var(--vvw-bg-color) h s calc(l + 40));
  --vvw-ui-border-radius: 0px;
  --vvw-ui-border-width: 0px;
}
```

## Best Practices

1. **Only override what you need** - Most variables have sensible defaults
2. **Test with different themes** for pre-built options before customizing
3. **Use semantic colors** - The UI colors derive from `--vvw-bg-color` automatically
4. **Consider accessibility** - Ensure adequate contrast ratios

## Next Steps

- Explore [pre-built themes](/styling/themes)
- Learn about [custom styling](/styling/custom)
- See [configuration options](/core/configuration/complete)
