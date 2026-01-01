---
title: Getting Started with Vue
description: Learn how to integrate VistaView with Vue 3 applications
---

VistaView provides official Vue 3 bindings with both a declarative component and a composable.

## Installation

```bash
npm install vistaview
```

## Component Approach (Recommended)

The `VistaView` component provides a declarative way to create image galleries:

```vue
<script setup>
import { VistaView } from 'vistaview/vue';
import 'vistaview/style.css';
</script>

<template>
  <VistaView selector="> a">
    <a href="/images/photo1-full.jpg">
      <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
    </a>
    <a href="/images/photo2-full.jpg">
      <img src="/images/photo2-thumb.jpg" alt="Photo 2" />
    </a>
  </VistaView>
</template>
```

### With Ref for Imperative Control

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

## Composable Approach

Use the `useVistaView` composable for more control:

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
    <button @click="vista.next()">Next</button>
    <button @click="vista.prev()">Previous</button>
  </div>
</template>
```

## With Extensions

```vue
<script setup>
import { useVistaView } from 'vistaview/vue';
import { download } from 'vistaview/extensions/download';
import 'vistaview/style.css';

const vista = useVistaView({
  elements: '#gallery a',
  controls: {
    topRight: ['zoomIn', 'zoomOut', 'download', 'close'],
  },
  extensions: [download()],
});
</script>

<template>
  <div id="gallery">
    <a href="/images/photo1.jpg">
      <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
    </a>
  </div>
</template>
```

## Options API

If you prefer the Options API:

```vue
<script>
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

export default {
  data() {
    return {
      vista: null,
    };
  },
  mounted() {
    this.vista = vistaView({
      elements: '#gallery a',
    });
  },
  beforeUnmount() {
    this.vista?.destroy();
  },
};
</script>

<template>
  <div id="gallery">
    <a href="/images/photo1.jpg">
      <img src="/images/photo1-thumb.jpg" alt="Photo 1" />
    </a>
  </div>
</template>
```

## TypeScript Support

VistaView provides full TypeScript support:

```vue
<script setup lang="ts">
import type { VistaInterface, VistaParamsNeo } from 'vistaview';

const config: VistaParamsNeo = {
  elements: '#gallery a',
  maxZoomLevel: 3,
  preloads: 2,
};
</script>
```

## Next Steps

- Explore [configuration options](/core/configuration)
- Learn about [extensions](/extensions/overview)
- Customize the [styling](/styling/themes)
