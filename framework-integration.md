# Framework Integration

VistaView provides official bindings for popular frameworks via subpath exports. It's also framework-agnostic and works with any JavaScript framework.

## React

VistaView ships with a built-in React hook and component:

```tsx
import { useVistaView, VistaView } from 'vistaview/react';
import 'vistaview/style.css';

// Option 1: Use the hook
function Gallery() {
  const { open, close, next, prev, getCurrentIndex, view } = useVistaView({
    elements: '#gallery a',
  });

  return (
    <div id="gallery">
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}

// Option 2: Use the component
function Gallery2() {
  return (
    <VistaView selector="a" className="gallery">
      <a href="/images/full.jpg">
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
import { vistaView, type VistaInterface } from 'vistaview';
import 'vistaview/style.css';

function Gallery({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<VistaInterface | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    instanceRef.current = vistaView({ elements: ref.current.querySelectorAll('a') });
    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  return <div ref={ref}>{children}</div>;
}
```

## Vue 3

VistaView ships with a built-in Vue composable and component:

```vue
<script setup>
import { useVistaView, VistaView } from 'vistaview/vue';
import 'vistaview/style.css';

// Option 1: Use the composable
const { open, close, next, prev, getCurrentIndex, view } = useVistaView({
  elements: '#gallery a',
});
</script>

<template>
  <!-- Option 1: With the composable -->
  <div id="gallery">
    <a href="/images/full.jpg">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
  </div>

  <!-- Option 2: Use the component -->
  <VistaView selector="a" class="gallery">
    <a href="/images/full.jpg">
      <img src="/images/thumb.jpg" alt="Photo" />
    </a>
  </VistaView>
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
  instance = vistaView({ elements: container.value.querySelectorAll('a') });
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

const { open, close, next, prev, getCurrentIndex, view } = useVistaView({
  elements: '#gallery a',
});
</script>

<div id="gallery">
  <a href="/images/full.jpg">
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
  instance = vistaView({ elements: container.querySelectorAll('a') });
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
  instance = vistaView({ elements: container.querySelectorAll('a') });
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

VistaView ships with a built-in Solid hook and component:

```tsx
import { useVistaView, VistaView } from 'vistaview/solid';
import 'vistaview/style.css';

// Option 1: Use the hook
function Gallery() {
  const { open, close, next, prev, getCurrentIndex, view } = useVistaView({
    elements: '#gallery a',
  });

  return (
    <div id="gallery">
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </div>
  );
}

// Option 2: Use the component
function Gallery2() {
  return (
    <VistaView selector="a" class="gallery">
      <a href="/images/full.jpg">
        <img src="/images/thumb.jpg" alt="Photo" />
      </a>
    </VistaView>
  );
}
```

### Manual Setup

```tsx
import { onMount, onCleanup, type ParentProps } from 'solid-js';
import { vistaView, type VistaInterface } from 'vistaview';
import 'vistaview/style.css';

function Gallery(props: ParentProps) {
  let container: HTMLDivElement | undefined;
  let instance: VistaInterface | null = null;

  onMount(() => {
    instance = vistaView({ elements: container!.querySelectorAll('a') });
  });

  onCleanup(() => {
    instance?.destroy();
  });

  return <div ref={container}>{props.children}</div>;
}
```

## Angular

```typescript
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { vistaView, type VistaInterface } from 'vistaview';

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
  private instance: VistaInterface | null = null;

  ngAfterViewInit() {
    this.instance = vistaView({
      elements: this.container.nativeElement.querySelectorAll('a'),
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
