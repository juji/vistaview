import { ref, onMounted, onUnmounted, type Ref } from 'vue';
import { vistaView } from './vistaview';
import type { VistaViewOptions, VistaViewInterface, VistaViewImage } from './vistaview';

export type { VistaViewOptions, VistaViewInterface, VistaViewImage };

type UseVistaViewOptions = Omit<VistaViewOptions, 'parent'>;

export function useVistaView(options: UseVistaViewOptions = {}) {
  const container: Ref<HTMLElement | null> = ref(null);
  let instance: VistaViewInterface | null = null;

  onMounted(() => {
    if (container.value) {
      instance = vistaView({ parent: container.value, ...options });
    }
  });

  onUnmounted(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    container,
    open: (i?: number) => instance?.open(i),
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
  };
}
