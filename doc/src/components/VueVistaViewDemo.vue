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
  <div class="vue-vista-demo">
    <VistaView ref="vistaRef" selector="> a">
      <a href="https://picsum.photos/seed/2222/1200/600">
        <img src="https://picsum.photos/seed/2222/400/200" alt="Image 1" />
      </a>
      <a href="https://picsum.photos/seed/4444/800/800">
        <img src="https://picsum.photos/seed/4444/200/200" alt="Image 2" />
      </a>
      <a href="https://picsum.photos/seed/6666/800/800">
        <img src="https://picsum.photos/seed/6666/200/200" alt="Image 3" />
      </a>
      <a href="https://picsum.photos/seed/8888/1200/600">
        <img src="https://picsum.photos/seed/8888/400/200" alt="Image 4" />
      </a>
    </VistaView>
    <button style="margin-top: 16px" @click="openGallery">Open Gallery</button>
  </div>
</template>

<style scoped>
.vue-vista-demo {
  max-width: 600px;
  margin: 0 auto;
}
</style>
