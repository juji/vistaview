---
title: Custom Styling
description: Create custom styles and themes for VistaView
---

There are two ways to customize the appearance of VistaView:

1. **Update CSS variables** - Quick customization using existing variables
2. **Create a custom CSS file** - Full theme with custom styling

## Method 1: Update CSS Variables

The simplest way to customize VistaView is by overriding CSS variables in your own stylesheet.

```css
/* custom.css */
:root {
  /* Colors */
  --vvw-bg-color: #1a1a2e;
  --vvw-text-color: #eee;
  --vvw-bg-opacity: 0.95;
  --vvw-bg-blur: 10px;

  /* UI Colors */
  --vvw-ui-outline-color: #333;
  --vvw-ui-bg-color: #16213e;
  --vvw-ui-text-color: #fff;
  --vvw-ui-hover-bg-color: #0f3460;
  --vvw-ui-active-bg-color: #e94560;

  /* UI Styling */
  --vvw-ui-border-radius: 12px;
  --vvw-ui-border-width: 1px;
}
```

Import after the base styles:

```javascript
import 'vistaview/style.css';
import './custom.css';
```

See the [CSS Variables](/styling/css-variables) reference for all available variables.

## Method 2: Create a Custom Theme

For more control, create a complete custom theme file that includes both variable overrides and custom styling.

```css
/* my-theme.css */

/* Override variables */
:root {
  --vvw-bg-color: #1a1a2e;
  --vvw-text-color: #eee;
  --vvw-ui-bg-color: #16213e;
  --vvw-ui-hover-bg-color: #0f3460;
  --vvw-ui-border-radius: 12px;
}

/* Custom component styling */
.vvw-ui {
  &.vvw-prev,
  &.vvw-next {
    button {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

      &:hover {
        transform: scale(1.1);
      }
    }
  }
}

.vvw-bottom-bar,
.vvw-top-bar {
  button {
    transition: all 200ms ease;

    &:hover {
      box-shadow: 0 0 12px var(--vvw-ui-hover-bg-color);
    }
  }
}
```

Import after the base styles:

```javascript
import 'vistaview/style.css';
import './my-theme.css';
```

## Accessibility Features

### Automatic Reduced Motion Support

VistaView detects the browser's `prefers-reduced-motion` setting and automatically disables slide transitions. This happens at runtime - no CSS configuration needed.

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --vvw-bg-color: #000;
    --vvw-text-color: #fff;
    --vvw-ui-bg-color: #000;
    --vvw-ui-text-color: #fff;
    --vvw-ui-hover-bg-color: #333;
    --vvw-ui-border-width: 2px;
  }
}
```

## Next Steps

- Review [CSS variables](/styling/css-variables) reference
- Explore [pre-built themes](/styling/themes)
- Check out [configuration options](/core/configuration/complete)
