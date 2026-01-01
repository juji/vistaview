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

## onContentChange

Called when the current image's content state changes (after zoom, pan, or when image finishes loading):

```typescript
vistaView({
  elements: '#gallery a',
  onContentChange: (content, vistaView) => {
    console.log('Image state changed');
    console.log('Current dimensions:', content.state.width, content.state.height);
    console.log('Transform:', content.state.transform);
    console.log('Zoom level:', content.state.transform.scale);
  },
});
```

**Use cases:**

- Track zoom level changes
- Monitor image dimensions during resize
- Sync image state with external UI
- Analytics for user interactions

**Parameters:**

- `content: VistaImageClone` - Current image state (dimensions, transform, config)
- `vistaView: VistaView` - The VistaView instance
