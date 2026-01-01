---
title: Custom Styling
description: Create custom styles and themes for VistaView
---

Learn how to create custom styling for VistaView beyond the pre-built themes.

## Creating a Custom Theme

Create a new CSS file for your theme:

```css
/* my-custom-theme.css */
:root {
  /* Colors */
  --vvw-bg-color: #1a1a2e;
  --vvw-bg-opacity: 0.95;
  --vvw-text-color: #eee;
  --vvw-ui-bg-color: #16213e;
  --vvw-ui-hover-bg: #0f3460;
  --vvw-focus-color: #e94560;

  /* Borders & Radius */
  --vvw-ui-border-radius: 12px;
  --vvw-img-border-radius: 4px;

  /* Shadows */
  --vvw-ui-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);

  /* Animation */
  --vvw-anim-dur: 400;
}
```

Import it after the base styles:

```javascript
import 'vistaview/style.css';
import './my-custom-theme.css';
```

## Styling Specific Components

### Customize Close Button

```css
.vvw-ctrl-close {
  --vvw-ui-bg-color: rgba(255, 0, 0, 0.3);
}

.vvw-ctrl-close:hover {
  --vvw-ui-bg-color: rgba(255, 0, 0, 0.5);
}
```

### Customize Navigation Arrows

```css
.vvw-nav-prev,
.vvw-nav-next {
  --vvw-ui-bg-color: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 60px;
  height: 60px;
}
```

### Customize Index Display

```css
.vvw-index {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  font-weight: bold;
  padding: 8px 16px;
}
```

### Customize Description

```css
.vvw-desc {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 16px;
  max-width: 600px;
  font-size: 14px;
  line-height: 1.6;
}
```

## Advanced Customizations

### Custom Loading Animation

```css
.vvw-item img.vvw-img-lo {
  filter: blur(20px);
  transform: scale(1.1);
}

.vvw-item img.vvw-img-hi {
  animation: fadeInSharp 0.3s ease-out;
}

@keyframes fadeInSharp {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

### Custom Zoom Indicators

```css
.vvw-ctrl-zoom-in::after {
  content: '+';
  font-size: 20px;
  font-weight: bold;
}

.vvw-ctrl-zoom-out::after {
  content: '−';
  font-size: 20px;
  font-weight: bold;
}
```

### Glassmorphism Style

```css
:root {
  --vvw-bg-color: rgba(255, 255, 255, 0.1);
  --vvw-bg-blur: 20px;
  --vvw-ui-bg-color: rgba(255, 255, 255, 0.15);
}

.vvw-ctrl {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

## Responsive Styling

```css
/* Mobile adjustments */
@media (max-width: 768px) {
  :root {
    --vvw-ui-padding: 8px;
    --vvw-font-size: 14px;
  }

  .vvw-desc {
    font-size: 12px;
    padding: 12px;
  }
}

/* Desktop adjustments */
@media (min-width: 1200px) {
  :root {
    --vvw-ui-padding: 16px;
    --vvw-font-size: 18px;
  }
}
```

## Accessibility Considerations

### High Contrast Mode

```css
@media (prefers-contrast: high) {
  :root {
    --vvw-ui-bg-color: #000;
    --vvw-ui-text-color: #fff;
    --vvw-border-color: #fff;
    --vvw-border-width: 2px;
  }
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  :root {
    --vvw-anim-dur: 0;
  }
}
```

### Focus Styles

```css
.vvw-ctrl:focus-visible {
  outline: 3px solid var(--vvw-focus-color);
  outline-offset: 2px;
}
```

## Class Reference

Common VistaView CSS classes:

- `.vvw` - Root container
- `.vvw-ctrl` - Control button container
- `.vvw-ctrl-close` - Close button
- `.vvw-ctrl-zoom-in` - Zoom in button
- `.vvw-ctrl-zoom-out` - Zoom out button
- `.vvw-index` - Index display
- `.vvw-desc` - Description
- `.vvw-nav-prev` - Previous arrow
- `.vvw-nav-next` - Next arrow
- `.vvw-item` - Image container
- `.vvw-img-lo` - Low-resolution thumbnail
- `.vvw-img-hi` - High-resolution image

## Next Steps

- Review [CSS variables](/styling/css-variables) reference
- Explore [pre-built themes](/styling/themes)
- Learn about [extensions](/extensions/overview)
