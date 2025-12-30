# Framework Integration

VistaView provides official bindings for popular frameworks via subpath exports. It's also framework-agnostic and works with any JavaScript framework.

## React

### Component (Recommended)

VistaView provides a declarative `VistaView` component:

```tsx
import { VistaView } from 'vistaview/react';
import 'vistaview/style.css';

function Gallery() {
  return (
    <VistaView selector="> a">
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </VistaView>
  );
}
```

With ref for imperative control:

```tsx
import { useRef } from 'react';
import { VistaView } from 'vistaview/react';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';

function Gallery() {
  const vistaRef = useRef<VistaInterface>(null);

  return (
    <>
      <VistaView ref={vistaRef} selector="> a">
        <a href="/images/full.jpg">
          <img src="/images/thumb.jpg" alt="Photo" />
        </a>
      </VistaView>
      <button onClick={() => vistaRef.current?.open(0)}>Open Gallery</button>
    </>
  );
}
```

### Hook

Alternatively, use the `useVistaView` hook for more control:

```tsx
import { useId } from 'react';
import { useVistaView } from 'vistaview/react';
import 'vistaview/style.css';

function Gallery() {
  const id = useId();
  const vista = useVistaView({
    elements: `#${CSS.escape(id)} a`,
  });

  return (
    <div id={id}>
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
      <button onClick={() => vista.open(0)}>Open Gallery</button>
    </div>
  );
}
```

## Vue 3

### Component (Recommended)

VistaView provides a declarative `VistaView` component:

```vue
<script setup>
import { VistaView } from 'vistaview/vue';
import 'vistaview/style.css';
</script>

<template>
  <VistaView selector="> a">
    <a href="/images/full.jpg">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
  </VistaView>
</template>
```

With ref for imperative control:

```vue
<script setup>
import { ref } from 'vue';
import { VistaView } from 'vistaview/vue';
import 'vistaview/style.css';

const vistaRef = ref();

const openGallery = () => {
  vistaRef.value?.instance?.open(0);
};
</script>

<template>
  <VistaView ref="vistaRef" selector="> a">
    <a href="/images/full.jpg">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
  </VistaView>
  <button @click="openGallery">Open Gallery</button>
</template>
```

### Composable

Alternatively, use the `useVistaView` composable for more control:

```vue
<script setup>
import { useId } from 'vue';
import { useVistaView } from 'vistaview/vue';
import 'vistaview/style.css';

const id = useId();
const vista = useVistaView({
  elements: `#${CSS.escape(id)} a`,
});
</script>

<template>
  <div :id="id">
    <a href="/images/full.jpg">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
    <button @click="vista.open(0)">Open Gallery</button>
  </div>
</template>
```

## Svelte

### Action (Recommended)

VistaView provides a `createVistaView` action for use with the `use:` directive:

```svelte
<script>
import { createVistaView } from 'vistaview/svelte';
import 'vistaview/style.css';
</script>

<div use:createVistaView={{ selector: '> a' }}>
  <a href="/images/full.jpg">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>
```

With ref for imperative control:

```svelte
<script>
import { createVistaView } from 'vistaview/svelte';
import 'vistaview/style.css';

let vista;

const openGallery = () => {
  vista?.open(0);
};
</script>

<div use:createVistaView={{ selector: '> a', ref: vista }}>
  <a href="/images/full.jpg">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>
<button on:click={openGallery}>Open Gallery</button>
```

### Hook

Alternatively, use the `useVistaView` hook for more control:

```svelte
<script>
import { useVistaView } from 'vistaview/svelte';
import 'vistaview/style.css';

const id = 'gallery-' + Math.random().toString(36).slice(2);
const vista = useVistaView({
  elements: `#${id} a`,
});
</script>

<div id={id}>
  <a href="/images/full.jpg">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
  <button on:click={() => vista.open(0)}>Open Gallery</button>
</div>
```

## Solid

### Directive (Recommended)

VistaView provides a `createVistaView` directive function:

```tsx
import { createVistaView } from 'vistaview/solid';
import 'vistaview/style.css';

function Gallery() {
  return (
    <div use:createVistaView={{ selector: '> a' }}>
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}
```

With ref for imperative control:

```tsx
import { createVistaView } from 'vistaview/solid';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';

function Gallery() {
  let vista: VistaInterface | undefined;

  return (
    <>
      <div use:createVistaView={{ selector: '> a', ref: (v) => (vista = v) }}>
        <a href="/images/full.jpg">
          <img src="/images/thumb.jpg" alt="Photo" />
        </a>
      </div>
      <button onClick={() => vista?.open(0)}>Open Gallery</button>
    </>
  );
}
```

### Hook

Alternatively, use the `useVistaView` hook for more control:

```tsx
import { useVistaView } from 'vistaview/solid';
import 'vistaview/style.css';

function Gallery() {
  const id = 'gallery-' + Math.random().toString(36).slice(2);
  const vista = useVistaView({
    elements: `#${id} a`,
  });

  return (
    <div id={id}>
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
      <button onClick={() => vista.open(0)}>Open Gallery</button>
    </div>
  );
}
```

## Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { vistaView, type VistaInterface } from 'vistaview';

@Component({
  selector: 'app-gallery',
  template: `
    <div #container id="gallery-{{ id }}">
      <ng-content></ng-content>
    </div>
  `,
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLElement>;
  private instance: VistaInterface | null = null;
  id = Math.random().toString(36).slice(2);

  ngAfterViewInit() {
    this.instance = vistaView({
      elements: `#gallery-${this.id} a`,
    });
  }

  ngOnDestroy() {
    this.instance?.destroy();
  }

  open(index?: number) {
    this.instance?.open(index);
  }

  close() {
    this.instance?.close();
  }
}
```

## Vanilla JavaScript

No framework? No problem:

```html
<div id="gallery">
  <a href="/images/full.jpg">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import 'vistaview/style.css';

  const gallery = vistaView({
    elements: '#gallery a',
  });

  // Methods available:
  // gallery.open(index)
  // gallery.close()
  // gallery.next()
  // gallery.prev()
  // gallery.view(index)
  // gallery.getCurrentIndex()
  // gallery.destroy()
</script>
```
