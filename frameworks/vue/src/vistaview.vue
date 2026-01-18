<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed } from 'vue';
import type { Ref } from 'vue';
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaOpt } from 'vistaview';

export default defineComponent({
  name: 'VistaView',
  props: {
    selector: { type: String, default: '> a' },
    options: { type: Object as () => VistaOpt, default: () => ({}) },
    id: { type: String, default: '' },
    // consumer can pass a ref to receive the API object
    vistaRef: { type: Object as () => Ref<VistaInterface | null> | null, default: null },
    // consumer can pass a ref to receive the root DOM element
    containerRef: { type: Object as () => Ref<HTMLElement | null> | null, default: null },
  },
  setup(props, { expose }) {
    const containerRef = ref<HTMLElement | null>(null);
    const instanceRef = ref<VistaInterface | null>(null);
    const generatedId = Math.random().toString(36).slice(2, 9);
    const galleryId = computed(() => (props.id || `vvw-gallery-${generatedId}`));

    // API object to expose and optionally assign to the passed `vistaRef` prop
    const api = {
      open: (i = 0) => instanceRef.value?.open(i),
      close: () => instanceRef.value?.close?.() ?? Promise.resolve(),
      reset: () => instanceRef.value?.reset(),
      next: () => instanceRef.value?.next(),
      prev: () => instanceRef.value?.prev(),
      zoomIn: () => instanceRef.value?.zoomIn(),
      zoomOut: () => instanceRef.value?.zoomOut(),
      getCurrentIndex: () => instanceRef.value?.getCurrentIndex?.() ?? -1,
      view: (i: number) => instanceRef.value?.view(i),
      destroy: () => instanceRef.value?.destroy(),
    } as unknown as VistaInterface;

    onMounted(() => {
      if (!containerRef.value) return;

      // initialize vista view instance
      instanceRef.value = vistaView({
        ...(props.options as VistaOpt),
        elements: `#${galleryId.value} ${props.selector}`,
      });

      // if the consumer passed containerRef prop, expose the DOM element
      if (props.containerRef) props.containerRef.value = containerRef.value;

      // if the consumer passed vistaRef prop, expose the API object
      if (props.vistaRef) props.vistaRef.value = api;
    });

    onBeforeUnmount(() => {
      instanceRef.value?.destroy();
      instanceRef.value = null;

      if (props.containerRef) props.containerRef.value = null;
      if (props.vistaRef) props.vistaRef.value = null;
    });

    // also expose API and DOM on the component instance for users who use `ref` on the component
    // expose: { vista, container } where `container` is a live getter to the DOM element
    expose({
      vista: api,
      get container() {
        return containerRef.value;
      },
    });

    return { containerRef, galleryId };
  },
});
</script>

<template>
  <div :id="galleryId" ref="containerRef">
    <slot />
  </div>
</template>
