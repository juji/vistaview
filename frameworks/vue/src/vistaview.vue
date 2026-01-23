<script lang="ts">
import { defineComponent, ref, onMounted, onBeforeUnmount, computed, watch, nextTick } from 'vue';
import { vistaView } from 'vistaview';
import type { VistaInterface, VistaOpt } from 'vistaview';

export default defineComponent({
  name: 'VistaView',
  props: {
    selector: { type: String, default: '> a' },
    options: { type: Object as () => VistaOpt, default: () => ({}) },
    id: { type: String, default: '' },
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

    // helper to initialize the instance; destroys previous instance if any
    function initInstance() {
      if (!containerRef.value) return;
      instanceRef.value?.destroy();
      instanceRef.value = vistaView({
        ...(props.options as VistaOpt),
        elements: `#${galleryId.value} ${props.selector}`,
      });
    }

    onMounted(() => {
      // initial instantiation
      initInstance();
    });

    onBeforeUnmount(() => {
      instanceRef.value?.destroy();
      instanceRef.value = null;
    });

    // watch props for changes and re-initialize
    watch(() => props.selector, () => {
      nextTick(() => initInstance());
    });

    watch(() => props.options, () => {
      nextTick(() => initInstance());
    }, { deep: true });

    // also expose API and DOM on the component instance for users who use `ref` on the component
    // expose: { vistaView, container } where `container` is a live getter to the DOM element
    expose({
      vistaView: api,
      get container() {
        return containerRef.value;
      },
    });

    return { containerRef, galleryId };
  },
});
</script>

<template>
  <div :id="galleryId" ref="containerRef" v-bind="$attrs">
    <slot />
  </div>
</template>
