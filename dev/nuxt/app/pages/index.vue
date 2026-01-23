
<template>
  <main style="padding: 32px;">
    <h1>VistaView Nuxt - Basic Example</h1>
    <VistaView class="vistaview-grid">
      <a
        v-for="(img, i) in images"
        :key="i"
        :href="img.full"
        class="vistaview-anchor"
      >
        <img :src="img.thumb" :alt="`Sample ${i + 1}`" class="vistaview-thumb" />
      </a>
    </VistaView>
  </main>
</template>


<script setup lang="ts">
import { VistaView } from 'vistaview/vue';
import 'vistaview/style.css';

const images = [
  { full: 'https://picsum.photos/id/1015/600/400', thumb: 'https://picsum.photos/id/1015/300/200' },
  { full: 'https://picsum.photos/id/1016/600/400', thumb: 'https://picsum.photos/id/1016/300/200' },
  { full: 'https://picsum.photos/id/1018/600/400', thumb: 'https://picsum.photos/id/1018/300/200' },
  { full: 'https://picsum.photos/id/1020/600/400', thumb: 'https://picsum.photos/id/1020/300/200' },
  { full: 'https://picsum.photos/id/1024/600/400', thumb: 'https://picsum.photos/id/1024/300/200' },
  { full: 'https://picsum.photos/id/1025/600/400', thumb: 'https://picsum.photos/id/1025/300/200' },
];
</script>

<style scoped>
.vistaview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 32px;
  max-width: 960px;
  margin: 32px auto 0 auto;
  align-items: stretch;
}
.vistaview-anchor {
  width: 100%;
  height: 200px;
  display: block;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 6px 0 rgba(0,0,0,0.06);
  transition: box-shadow 0.15s;
}
.vistaview-anchor:hover {
  box-shadow: 0 4px 16px 0 rgba(0,0,0,0.10);
  outline: 4px solid #0051a8;
  outline-offset: 3px;
  z-index: 2;
}
  
.vistaview-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
</style>
