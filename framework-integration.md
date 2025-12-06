# Framework Integration

VistaView is framework-agnostic and works with any JavaScript framework. Below are examples for popular frameworks.

## React

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

### Custom Hook

Create a reusable hook:

```tsx
import { useEffect, useRef, useCallback } from 'react';
import { vistaView, type VistaViewOptions, type VistaViewInterface } from 'vistaview';

export function useVistaView(options: Omit<VistaViewOptions, 'parent'> = {}) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VistaViewInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current = vistaView({ parent: ref.current, ...options });
    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  const open = useCallback((index = 0) => instanceRef.current?.open(index), []);
  const close = useCallback(() => instanceRef.current?.close(), []);
  const next = useCallback(() => instanceRef.current?.next(), []);
  const prev = useCallback(() => instanceRef.current?.prev(), []);
  const view = useCallback((index: number) => instanceRef.current?.view(index), []);
  const getCurrentIndex = useCallback(() => instanceRef.current?.getCurrentIndex() ?? -1, []);

  return { ref, open, close, next, prev, view, getCurrentIndex };
}

// Usage
function Gallery() {
  const { ref, open } = useVistaView();

  return (
    <div ref={ref}>
      <a href="/images/full.jpg" data-vistaview-width="1920" data-vistaview-height="1080">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}
```

## Vue 3

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

### Composable

Create a reusable composable:

```ts
// useVistaView.ts
import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { vistaView, type VistaViewOptions, type VistaViewInterface } from 'vistaview';

export function useVistaView(options: Omit<VistaViewOptions, 'parent'> = {}) {
  const container: Ref<HTMLElement | null> = ref(null);
  let instance: VistaViewInterface | null = null;

  onMounted(() => {
    if (container.value) {
      instance = vistaView({ parent: container.value, ...options });
    }
  });

  onUnmounted(() => {
    instance?.destroy();
  });

  return {
    container,
    open: (index?: number) => instance?.open(index),
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    view: (index: number) => instance?.view(index),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
  };
}
```

## Svelte 5

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

## Svelte 4

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
  <a href="/images/full.jpg" data-vistaview-width="1920" data-vistaview-height="1080">
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
