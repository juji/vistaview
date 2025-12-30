# Framework Integration

VistaView provides official bindings for popular frameworks via subpath exports. It's also framework-agnostic and works with any JavaScript framework.

## React

VistaView provides a React hook:

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

VistaView provides a Vue composable:

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

VistaView provides a Svelte hook:

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

VistaView provides a Solid hook:

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
