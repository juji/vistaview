---
title: Elements Configuration
description: How to specify images for VistaView galleries
---

VistaView supports multiple ways to specify which images should be included in your gallery.

## Using CSS Selector

The most common approach - select anchor tags containing images:

```typescript
vistaView({
  elements: '#gallery a',
});
```

```html
<div id="gallery">
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
</div>
```

## Using Image Elements

Select images directly with `data-vistaview-src`:

```typescript
vistaView({
  elements: '#gallery img',
});
```

```html
<div id="gallery">
  <img src="/images/thumb.jpg" data-vistaview-src="/images/full.jpg" alt="Photo" />
</div>
```

## Using Array of Images

Pass an array of image configuration objects:

```typescript
vistaView({
  elements: [
    { src: '/images/photo1.jpg', alt: 'Photo 1' },
    {
      src: '/images/photo2.jpg',
      alt: 'Photo 2',
      srcSet: '/images/photo2-800.jpg 800w, /images/photo2-1200.jpg 1200w',
    },
  ],
});
```

**Note:** Thumbnails are not supported when using an array. Use DOM elements for progressive loading.
