---
title: React Integration
description: How to use VistaView with React, with strict source-based, type-annotated examples.
---

# React Integration

This guide explains how to use VistaView in React projects with TypeScript, based strictly on the source code and package exports.

## Installation

Install the required packages:

```sh
pnpm add vistaview @vistaview/react
```

Or with npm:

```sh
npm install vistaview @vistaview/react
```

## Usage

Import the `VistaView` component and use it to wrap your gallery elements. All props are strictly typed.

```tsx
import { VistaView } from '@vistaview/react';

export function Gallery() {
  return (
    <VistaView selector="> a">
      <a href="/img1.jpg"><img src="/thumb1.jpg" /></a>
      <a href="/img2.jpg"><img src="/thumb2.jpg" /></a>
    </VistaView>
  );
}
```

## Props

- `selector?: string` — CSS selector for gallery items (default: `> a`)
- `options?: VistaOpt` — VistaView options (see [core configuration](../../core/configuration/))
- `ref?: React.Ref<VistaComponentRef>` — Access the underlying VistaView instance and container
- All standard `div` props are supported

### TypeScript Types

All props and refs are fully typed:

```ts
import type { VistaOpt, VistaInterface } from 'vistaview';
import type { VistaComponentRef } from '@vistaview/react';

// VistaComponentRef type:
// { vistaView: VistaInterface | null; container: HTMLDivElement | null } | null
```

## Accessing the Instance

You can use a ref to access the underlying VistaView instance and container:

```tsx
import { useRef } from 'react';
import { VistaView, VistaComponentRef } from '@vistaview/react';

export function Gallery() {
  const ref = useRef<VistaComponentRef>(null);

  return (
    <VistaView ref={ref}>
      <a href="/img1.jpg"><img src="/thumb1.jpg" /></a>
    </VistaView>
  );
}
```

## Events

Event callbacks are passed via the `options` prop. All callbacks must have explicit TypeScript type annotations:

```tsx
import type { VistaOpt, VistaEvent } from 'vistaview';

const options: VistaOpt = {
  onOpen: (event: VistaEvent): void => {
    // ...
  },
  onClose: (event: VistaEvent): void => {
    // ...
  },
};

<VistaView options={options}>
  {/* ... */}
</VistaView>
```

See [events documentation](../../core/configuration/events) for all available events and their types.

## SSR/Next.js

The component is safe for SSR. For Next.js, use as above. No special handling is required.

## Source Verification

All types and props are strictly verified against the source code in `frameworks/react/src/vistaview.tsx`.

---

For more details, see the [VistaView React source](https://github.com/juji-io/vistaview/tree/main/frameworks/react/src/vistaview.tsx).
