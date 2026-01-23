import { ref, onMounted, onBeforeUnmount } from 'vue';
import { vistaView } from 'vistaview';
import type { VistaParams, VistaInterface } from 'vistaview';

export function useVistaView(options: VistaParams): VistaInterface {
  const instance = ref<VistaInterface | null>(null);
  
  onMounted(() => {
    // no-op for now
    instance.value = vistaView(options);
    console.log('VistaView instance created', instance.value);
  });

  onBeforeUnmount(() => {
    console.log('Destroying VistaView instance', instance.value);
    instance.value?.destroy();
    instance.value = null;
  });

  return {
    open: (i = 0) => instance.value?.open(i),
    close: () => instance.value?.close?.() ?? Promise.resolve(),
    reset: () => instance.value?.reset(),
    next: () => instance.value?.next(),
    prev: () => instance.value?.prev(),
    zoomIn: () => instance.value?.zoomIn(),
    zoomOut: () => instance.value?.zoomOut(),
    getCurrentIndex: () => instance.value?.getCurrentIndex?.() ?? -1,
    view: (i: number) => instance.value?.view(i),
    destroy: () => instance.value?.destroy(),
  } as unknown as VistaInterface;
}