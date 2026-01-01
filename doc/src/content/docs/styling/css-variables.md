---
title: CSS Variables
description: Customize VistaView appearance with CSS custom properties
---

VistaView uses CSS custom properties (CSS variables) for easy customization without modifying the source code.

## Basic Styling

Import the base CSS file:

```javascript
import 'vistaview/style.css';
```

Then override variables in your own CSS:

```css
:root {
  --vvw-bg-color: #000000;
  --vvw-text-color: #ffffff;
  --vvw-anim-dur: 333;
}
```

## Complete Variable Reference

### Colors

#### Background Colors

```css
:root {
  /* Main background color */
  --vvw-bg-color: #000000;

  /* Background opacity (0-1) */
  --vvw-bg-opacity: 0.95;

  /* Background blur amount */
  --vvw-bg-blur: 10px;
}
```

#### Text Colors

```css
:root {
  /* Main text color */
  --vvw-text-color: #ffffff;

  /* Secondary/muted text color */
  --vvw-text-muted: #999999;
}
```

#### UI Element Colors

```css
:root {
  /* Button/control background */
  --vvw-ui-bg-color: rgba(255, 255, 255, 0.1);

  /* Button/control text color */
  --vvw-ui-text-color: #ffffff;

  /* Button/control hover background */
  --vvw-ui-hover-bg: rgba(255, 255, 255, 0.2);

  /* Button/control active/pressed state */
  --vvw-ui-active-bg: rgba(255, 255, 255, 0.3);

  /* Disabled button state */
  --vvw-ui-disabled-opacity: 0.5;
}
```

#### Border Colors

```css
:root {
  /* Border color for UI elements */
  --vvw-border-color: rgba(255, 255, 255, 0.2);

  /* Focus outline color */
  --vvw-focus-color: #4a9eff;
}
```

### Animation

```css
:root {
  /* Base animation duration in milliseconds */
  /* Used for all transitions and animations */
  --vvw-anim-dur: 333;

  /* Easing function for animations */
  --vvw-easing: cubic-bezier(0.4, 0, 0.2, 1);

  /* Fade-in easing (when opening) */
  --vvw-fade-in-easing: ease-out;

  /* Fade-out easing (when closing) */
  --vvw-fade-out-easing: ease-in;
}
```

### Borders & Radius

```css
:root {
  /* Border radius for UI elements */
  --vvw-ui-border-radius: 8px;

  /* Border radius for images */
  --vvw-img-border-radius: 0px;

  /* Border width for UI elements */
  --vvw-border-width: 1px;
}
```

### Shadows

```css
:root {
  /* Shadow for UI controls */
  --vvw-ui-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

  /* Shadow for main image */
  --vvw-img-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
}
```

### Spacing

```css
:root {
  /* Padding inside UI controls */
  --vvw-ui-padding: 12px;

  /* Margin between UI controls */
  --vvw-ui-margin: 8px;

  /* Gap between control groups */
  --vvw-control-gap: 16px;
}
```

### Typography

```css
:root {
  /* Font family */
  --vvw-font-family: system-ui, -apple-system, sans-serif;

  /* Base font size */
  --vvw-font-size: 16px;

  /* Font weight */
  --vvw-font-weight: 400;

  /* Line height */
  --vvw-line-height: 1.5;
}
```

### Z-Index Layers

```css
:root {
  /* Base z-index (set via initialZIndex option) */
  --vvw-z-base: 1000;

  /* Overlay layer (background) */
  --vvw-z-overlay: calc(var(--vvw-z-base) + 0);

  /* Content layer (images) */
  --vvw-z-content: calc(var(--vvw-z-base) + 1);

  /* Controls layer (UI) */
  --vvw-z-controls: calc(var(--vvw-z-base) + 2);
}
```

## Customization Examples

### Dark Theme

```css
:root {
  --vvw-bg-color: #000000;
  --vvw-bg-opacity: 0.98;
  --vvw-text-color: #ffffff;
  --vvw-ui-bg-color: rgba(255, 255, 255, 0.1);
}
```

### Light Theme

```css
:root {
  --vvw-bg-color: #ffffff;
  --vvw-bg-opacity: 0.98;
  --vvw-text-color: #000000;
  --vvw-ui-bg-color: rgba(0, 0, 0, 0.1);
  --vvw-ui-text-color: #000000;
  --vvw-border-color: rgba(0, 0, 0, 0.2);
}
```

### Colorful Theme

```css
:root {
  --vvw-bg-color: #1a1a2e;
  --vvw-text-color: #eee;
  --vvw-ui-bg-color: #16213e;
  --vvw-ui-hover-bg: #0f3460;
  --vvw-focus-color: #e94560;
}
```

### Rounded Theme

```css
:root {
  --vvw-ui-border-radius: 16px;
  --vvw-img-border-radius: 8px;
}
```

### Minimal Theme

```css
:root {
  --vvw-ui-bg-color: transparent;
  --vvw-ui-hover-bg: rgba(255, 255, 255, 0.1);
  --vvw-border-color: transparent;
  --vvw-ui-shadow: none;
  --vvw-img-shadow: none;
}
```

### Slow Animations

```css
:root {
  --vvw-anim-dur: 600;
  --vvw-easing: cubic-bezier(0.4, 0, 0.6, 1);
}
```

### Instant Animations

```css
:root {
  --vvw-anim-dur: 0;
}
```

## Scoped Customization

You can scope variables to specific instances:

```html
<style>
  .custom-gallery {
    --vvw-bg-color: #1a1a1a;
    --vvw-ui-bg-color: #2a2a2a;
  }
</style>

<div class="custom-gallery">
  <a href="/image1.jpg">
    <img src="/thumb1.jpg" alt="Image 1" />
  </a>
</div>
```

## Component-Specific Variables

### Control Buttons

```css
/* All buttons */
.vvw-ctrl button {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  border-radius: var(--vvw-ui-border-radius);
  padding: var(--vvw-ui-padding);
}

/* Specific buttons */
.vvw-ctrl-close {
  --vvw-ui-bg-color: rgba(255, 0, 0, 0.2);
}

.vvw-ctrl-zoom-in {
  --vvw-ui-bg-color: rgba(0, 255, 0, 0.2);
}
```

### Image Container

```css
.vvw-item img {
  border-radius: var(--vvw-img-border-radius);
  box-shadow: var(--vvw-img-shadow);
}
```

### Index Display

```css
.vvw-index {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  font-size: var(--vvw-font-size);
  padding: var(--vvw-ui-padding);
}
```

### Description

```css
.vvw-desc {
  background: var(--vvw-ui-bg-color);
  color: var(--vvw-ui-text-color);
  font-size: var(--vvw-font-size);
  padding: var(--vvw-ui-padding);
}
```

## Browser Support

CSS custom properties are supported in all modern browsers:

- Chrome 49+
- Firefox 31+
- Safari 9.1+
- Edge 15+

For older browsers, variables will fall back to default values defined in the stylesheet.

## Debugging Variables

To see which variables are applied:

```javascript
// In browser console
getComputedStyle(document.documentElement).getPropertyValue('--vvw-bg-color');
```

Or use browser DevTools to inspect and modify variables in real-time.

## Best Practices

1. **Define variables in `:root`** for global changes
2. **Use semantic naming** when creating custom variables
3. **Test with different themes** to ensure readability
4. **Consider accessibility** (contrast ratios, reduced motion)
5. **Document your customizations** for maintainability

## Next Steps

- Explore [pre-built themes](/styling/themes)
- Learn about [custom styling](/styling/custom)
- See [configuration options](/core/configuration/complete)
