---
title: Event Callbacks
description: Handle VistaView lifecycle events
---

## onOpen

Called when the lightbox opens:

```typescript
vistaView({
  elements: '#gallery a',
  onOpen: (vistaView) => {
    console.log('Lightbox opened');
    document.body.style.overflow = 'hidden';
  },
});
```

## onClose

Called when the lightbox closes:

```typescript
vistaView({
  elements: '#gallery a',
  onClose: (vistaView) => {
    console.log('Lightbox closed');
    document.body.style.overflow = '';
  },
});
```

## onImageView

Called when viewing an image (including on open):

```typescript
vistaView({
  elements: '#gallery a',
  onImageView: (data) => {
    console.log('Viewing image:', data.index.to);
    console.log('Previous image:', data.index.from);
  },
});
```
