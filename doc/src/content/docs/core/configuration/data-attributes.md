---
title: Data Attributes
description: Use HTML data attributes to customize VistaView behavior
---

VistaView supports these data attributes on HTML elements:

| Attribute               | Description                                     |
| ----------------------- | ----------------------------------------------- |
| `data-vistaview-src`    | Full-size image URL (overrides href/src)        |
| `data-vistaview-srcset` | Responsive image srcset                         |
| `data-vistaview-alt`    | Alt text for lightbox (overrides element's alt) |

Example:

```html
<a href="/fallback.jpg" data-vistaview-src="/images/full.jpg">
  <img
    src="/images/thumb.jpg"
    alt="Thumbnail text"
    data-vistaview-alt="Different text in lightbox"
  />
</a>
```
