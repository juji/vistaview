---
title: Getting Started with Svelte
description: Learn how to integrate VistaView with Svelte applications
---

VistaView provides a `useVistaView` hook for Svelte applications.

## Installation

```bash
npm install vistaview
```

## Basic Usage

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
  <a href="/images/photo1-full.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
  <a href="/images/photo2-full.jpg">
    <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
  </a>
</div>
```

## With Control Buttons

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
</div>

<button on:click={() => vista.open(0)}>Open Gallery</button>
<button on:click={() => vista.next()}>Next</button>
<button on:click={() => vista.prev()}>Previous</button>
```

## With Extensions

```svelte
<script>
import { useVistaView } from 'vistaview/svelte';
import { download } from 'vistaview/extensions/download';
import 'vistaview/style.css';

const id = 'gallery-' + Math.random().toString(36).slice(2);
const vista = useVistaView({
  elements: `#${id} a`,
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
</script>

<div id={id}>
  <a href="/images/photo1.jpg">
    <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
  </a>
</div>
```

## Direct Usage

For more control, you can use the core `vistaView` function directly:

```svelte
<script>
import { onMount } from 'svelte';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

let instance;

onMount(() => {
  instance = vistaView({
    elements: '#my-gallery a',
  });

  return () => {
    instance?.destroy();
  };
});

function openGallery() {
  instance?.open(0);
}
</script>

<div id="my-gallery">
  <a href="/images/full.jpg">
    <img src="/images/thumb.jpg" alt="Photo" />
  </a>
</div>

<button on:click={openGallery}>Open Gallery</button>
```

## TypeScript Support

VistaView provides full TypeScript support:

```svelte
<script lang="ts">
import type { VistaInterface, VistaParamsNeo } from 'vistaview';

const config: VistaParamsNeo = {
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
};
</script>
```

## SvelteKit

VistaView works seamlessly with SvelteKit. Make sure to import it only on the client side:

```svelte
<script>
import { browser } from '$app/environment';
import { onMount } from 'svelte';

let vista;

onMount(async () => {
  if (browser) {
    const { useVistaView } = await import('vistaview/svelte');
    await import('vistaview/style.css');

    vista = useVistaView({
      elements: '#gallery a',
    });
  }
});
</script>
```

## Next Steps

- Explore [configuration options](/core/configuration)
- Learn about [extensions](/extensions/overview)
- Customize the [styling](/styling/themes)
