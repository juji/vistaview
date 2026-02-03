---
title: Event Callbacks
description: Event callback functions and data types
---

Event callbacks allow you to hook into different stages of the lightbox lifecycle.

## Event Callback Types

### onOpen

Triggered when the lightbox opens.

```typescript
onOpen?: (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView:` [VistaView](/api-reference/classes/vistaview) - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery > a',
  onOpen: (vistaView) => {
    console.log('Lightbox opened');
    console.log('Total images:', vistaView.state.elmLength);
  },
});
```

### onClose

Triggered when the lightbox closes.

```typescript
onClose?: (vistaView: VistaView) => void;
```

**Parameters:**

- `vistaView:` [VistaView](/api-reference/classes/vistaview) - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery > a',
  onClose: (vistaView) => {
    console.log('Lightbox closed');
    console.log('Last viewed index:', vistaView.state.index);
  },
});
```

### onImageView

Triggered when navigating between images or when opening at a specific image.

```typescript
onImageView?: (data: VistaData, vistaView: VistaView) => void;
```

**Parameters:**

- `data:` [VistaData](/api-reference/types#vistadata) - Navigation data with from/to information
- `vistaView:` [VistaView](/api-reference/classes/vistaview) - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery > a',
  onImageView: (data, vistaView) => {
    console.log(`Viewing image ${data.index.to! + 1} of ${vistaView.state.elmLength}`);
    if (data.via.next) console.log('→ Next');
    if (data.via.prev) console.log('← Previous');
  },
});
```

### onContentChange

Triggered when content changes (including zoom operations).

```typescript
onContentChange?: (content: VistaImageClone, vistaView: VistaView) => void;
```

**Parameters:**

- `content:` [VistaImageClone](/api-reference/types#vistaimageclone) - The changed content
- `vistaView:` [VistaView](/api-reference/classes/vistaview) - The VistaView instance

**Example:**

```typescript
vistaView({
  elements: '#gallery > a',
  onContentChange: (content, vistaView) => {
    console.log('Zoom level:', content.scale.toFixed(2) + 'x');
  },
});
```

**Event Data Types:** See [Types](/api-reference/types) for:

- [VistaData](/api-reference/types#vistadata) - Navigation and transition data
- [VistaImageClone](/api-reference/types#vistaimageclone) - Current image state
- [VistaParsedElm](/api-reference/types#vistaparsedelm) - Parsed element information
- [VistaImgOrigin](/api-reference/types#vistaimgorigin) - Origin element properties

## Related

- [Main Function](/api-reference/main-function)
- [Lifecycle Functions](/api-reference/lifecycle)
- [Types](/api-reference/types)
- [Events Configuration Guide](/core/configuration/events)
