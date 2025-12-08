# Framework Integration

VistaView provides official bindings for popular frameworks via subpath exports. It's also framework-agnostic and works with any JavaScript framework.

## React

VistaView ships with a built-in React hook and component:

```tsx
import { useVistaView, VistaView } from 'vistaview/react';
import 'vistaview/style.css';

// Option 1: Use the hook
function Gallery() {
  const { ref, open, close, next, prev, getCurrentIndex } = useVistaView();

  return (
    <div ref={ref}>
      <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}

// Option 2: Use the component
function Gallery2() {
  return (
    <VistaView>
      <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </VistaView>
  );
}
```

### Manual Setup

If you prefer manual setup:

```tsx
import { useEffect, useRef } from 'react';
import { vistaView, type VistaViewInterface } from 'vistaview';
import 'vistaview/style.css';

function Gallery({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VistaViewInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current = vistaView({ parent: ref.current });
    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

## Vue 3

VistaView ships with a built-in Vue composable:

```vue
<script setup>
import { useVistaView } from 'vistaview/vue';
import 'vistaview/style.css';

const { container, open, close, next, prev, getCurrentIndex } = useVistaView();
</script>

<template>
  <div ref="container">
    <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
  </div>
</template>
```

### Manual Setup

If you prefer manual setup:

```vue
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

const container = ref(null);
let instance = null;

onMounted(() => {
  instance = vistaView({ parent: container.value });
});

onUnmounted(() => {
  instance?.destroy();
});
</script>

<template>
  <div ref="container">
    <slot />
  </div>
</template>
```

## Svelte

VistaView ships with a built-in Svelte hook:

```svelte
<script>
import { useVistaView } from 'vistaview/svelte';
import 'vistaview/style.css';

const { init, open, close, next, prev, getCurrentIndex } = useVistaView();
</script>

<div use:init>
  <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>
```

### Manual Setup (Svelte 5)

```svelte
<script>
import { onMount, onDestroy } from 'svelte';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

let container;
let instance;

onMount(() => {
  instance = vistaView({ parent: container });
});

onDestroy(() => {
  instance?.destroy();
});
</script>

<div bind:this={container}>
  {@render children()}
</div>
```

### Manual Setup (Svelte 4)

```svelte
<script>
import { onMount, onDestroy } from 'svelte';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

let container;
let instance;

onMount(() => {
  instance = vistaView({ parent: container });
});

onDestroy(() => {
  instance?.destroy();
});
</script>

<div bind:this={container}>
  <slot />
</div>
```

## Solid

VistaView ships with a built-in Solid hook:

```tsx
import { useVistaView } from 'vistaview/solid';
import 'vistaview/style.css';

function Gallery() {
  const { init, open, close, next, prev, getCurrentIndex } = useVistaView();

  return (
    <div ref={init}>
      <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}
```

### Manual Setup

```tsx
import { onMount, onCleanup, type ParentProps } from 'solid-js';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

function Gallery(props: ParentProps) {
  let container: HTMLDivElement | undefined;

  onMount(() => {
    const instance = vistaView({ parent: container! });
    onCleanup(() => instance.destroy());
  });

  return <div ref={container}>{props.children}</div>;
}
```

## Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { vistaView, type VistaViewInterface } from 'vistaview';

@Component({
  selector: 'app-gallery',
  template: `
    <div #container>
      <ng-content></ng-content>
    </div>
  `,
})
export class GalleryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('container') container!: ElementRef<HTMLElement>;
  private instance: VistaViewInterface | null = null;

  ngAfterViewInit() {
    this.instance = vistaView({ parent: this.container.nativeElement });
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
  <a href="/images/full.jpg" data-vvw-width="1920" data-vvw-height="1080">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>

<script type="module">
  import { vistaView } from 'vistaview';
  import 'vistaview/style.css';

  const { open, close, destroy } = vistaView({
    parent: document.getElementById('gallery'),
  });
</script>
```
