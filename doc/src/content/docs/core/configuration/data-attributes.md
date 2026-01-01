---
title: Data Attributes
description: Use HTML data attributes to customize VistaView behavior
---

VistaView uses data attributes to customize how images are displayed in the lightbox. These attributes provide fine-grained control over individual images without requiring JavaScript configuration.

## Available Attributes

| Attribute               | Description             | Priority |
| ----------------------- | ----------------------- | -------- |
| `data-vistaview-src`    | Full-size image URL     | Highest  |
| `data-vistaview-srcset` | Responsive image srcset | Highest  |
| `data-vistaview-alt`    | Alt text for lightbox   | Highest  |

## Attribute Priority

VistaView follows a specific priority order when parsing elements:

### Image Source (`src`)

1. `data-vistaview-src` (highest priority)
2. `href` attribute (for `<a>` tags)
3. `src` attribute (on the element itself)
4. `src` attribute (on child `<img>` tag)

### Responsive Images (`srcset`)

1. `data-vistaview-srcset` (highest priority)
2. `srcset` attribute (on the element itself)
3. `srcset` attribute (on child `<img>` tag)

### Alt Text (`alt`)

1. `data-vistaview-alt` (highest priority)
2. `alt` attribute (on the element itself)
3. `alt` attribute (on child `<img>` tag)

## Examples

### Basic Override

Override the lightbox image URL while keeping the thumbnail:

```html
<a href="/thumbnail.jpg" data-vistaview-src="/images/fullsize.jpg">
  <img src="/thumbnail.jpg" alt="My image" />
</a>
```

### Responsive Images

Provide different images based on the displayed image size. VistaView dynamically selects the most appropriate image as the image size changes:

```html
<a
  href="/fallback.jpg"
  data-vistaview-srcset="/small.jpg 800w, /medium.jpg 1200w, /large.jpg 2000w"
>
  <img src="/thumbnail.jpg" alt="Responsive image" />
</a>
```

**How it works:**

- VistaView monitors the **image's display width** (not viewport width) and automatically switches to the optimal image from the srcset
- The image display width depends on the viewport and the image's aspect ratio (portrait images are constrained by height, landscape by width)
- Accounts for device pixel ratio (DPI) for high-resolution displays (e.g., Retina screens)
- Selects the smallest image that meets or exceeds the required display width
- Dynamically swaps images during opening animation and zoom gestures

**Format:** `"url widthDescriptorw, url widthDescriptorw, ..."` where width descriptors specify the image's actual pixel width.

**Example with pixel calculations:**

```html
<!-- A portrait photo (3000×4000px) in a 1920×1080 viewport:
     - Image is constrained by viewport height: 1080px tall
     - Display width: 1080 × (3000/4000) = 810px wide
     - On 2× DPI: requires 810 × 2 = 1620px → selects large-2400.jpg
     - When zoomed 2×: 1620px display × 2 = 3240px → still uses large-2400.jpg -->
<img
  src="/thumb.jpg"
  data-vistaview-srcset="/small-600.jpg 600w, /medium-1200.jpg 1200w, /large-2400.jpg 2400w"
  alt="Adaptive resolution"
/>
```

### Custom Alt Text

Display different text in the thumbnail vs lightbox:

```html
<a href="/photo.jpg">
  <img
    src="/photo.jpg"
    alt="Thumbnail caption"
    data-vistaview-alt="Detailed description shown in lightbox"
  />
</a>
```

### Combining Attributes

Use multiple attributes together. When both `src` and `srcset` are provided, `srcset` takes precedence and `src` serves as fallback:

```html
<a
  href="/fallback.jpg"
  data-vistaview-src="/images/full.jpg"
  data-vistaview-srcset="/images/small.jpg 800w, /images/large.jpg 1600w"
  data-vistaview-alt="High-resolution artwork"
>
  <img src="/images/thumb.jpg" alt="Click to view" />
</a>
```

**Priority order:** If `srcset` is available, VistaView uses responsive selection. The `src` attribute (or `data-vistaview-src`) is used only when `srcset` is not provided.

## Common Use Cases

### CDN or Different Domain

Use `data-vistaview-src` when your full-size images are on a different domain:

```html
<a href="/local-thumb.jpg" data-vistaview-src="https://cdn.example.com/images/full.jpg">
  <img src="/local-thumb.jpg" alt="Image" />
</a>
```

### Progressive Enhancement

Load low-res thumbnails initially, specify high-res for lightbox:

```html
<img src="/thumb-low.jpg" data-vistaview-src="/full-high.jpg" alt="Progressive image" />
```

### Dynamic Alt Text

Provide context-specific descriptions:

```html
<a href="/product.jpg" data-vistaview-alt="Product X - Model 2024, Color: Blue, Size: Large">
  <img src="/product-thumb.jpg" alt="Product X" />
</a>
```
