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

Provide different images for different screen sizes:

```html
<a
  href="/fallback.jpg"
  data-vistaview-srcset="/small.jpg 800w, /medium.jpg 1200w, /large.jpg 2000w"
>
  <img src="/thumbnail.jpg" alt="Responsive image" />
</a>
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

Use multiple attributes together:

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
