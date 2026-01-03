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
  onImageView: (data, vistaView) => {
    console.log('Viewing image:', data.index.to);
    console.log('Previous image:', data.index.from);
    console.log('Navigation direction:', data.via);

    // Access the current and previous images
    if (data.images.to) {
      console.log('Current images:', data.images.to);
    }

    // Access HTML elements
    if (data.htmlElements.to) {
      console.log('Current HTML elements:', data.htmlElements.to);
    }
  },
});
```

**Parameters:**

- `data: VistaData` - Navigation data
- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

**VistaData type:**

```typescript
type VistaData = {
  htmlElements: {
    from: HTMLElement[] | null; // Previous HTML elements
    to: HTMLElement[] | null; // Current HTML elements
  };
  images: {
    from: VistaBox[] | null; // Previous VistaBox instances
    to: VistaBox[] | null; // Current VistaBox instances
  };
  index: {
    from: number | null; // Previous image index (null on initial open)
    to: number | null; // Current image index
  };
  via: {
    next: boolean; // True if navigated via next
    prev: boolean; // True if navigated via prev
  };
};
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
- `vistaView:` [VistaView](/api-reference/vistaview) - The VistaView instance

**VistaImageClone type:**

```typescript
type VistaImageClone = {
  config: {
    src: string; // Image source URL
    alt?: string; // Alt text
    srcSet?: string; // Responsive image srcset
  };
  origin: {
    src: string; // Original source from HTML
    srcSet: string; // Original srcset from HTML
    borderRadius: string; // Original border radius
    objectFit: string; // Original object-fit value
  } | null;
  parsedSrcSet?: {
    // Parsed srcset entries
    src: string;
    width: number;
  }[];
  element: string; // HTML string of the image element
  thumb?: string; // HTML string of thumbnail (if exists)
  index: number; // Image index in gallery
  pos: number; // Position relative to current (-1, 0, 1)
  state: {
    width: number; // Current display width (px)
    height: number; // Current display height (px)
    transform: {
      x: number; // Transform X offset (px)
      y: number; // Transform Y offset (px)
      scale: number; // Scale factor (1 = normal)
    };
    translate: {
      x: number; // CSS translate X (px)
      y: number; // CSS translate Y (px)
    };
  };
};
```
