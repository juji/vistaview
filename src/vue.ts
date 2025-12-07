import { onMounted, onUnmounted } from 'vue';
import { vistaView } from './vistaview';
import type { VistaViewOptions, VistaViewInterface, VistaViewImage } from './vistaview';

export type { VistaViewOptions, VistaViewInterface, VistaViewImage };

export function useVistaView(options: VistaViewOptions) {
  let instance: VistaViewInterface | null = null;

  onMounted(() => {
    instance = vistaView(options);
  });

  onUnmounted(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    open: (i?: number) => instance?.open(i),
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
  };
}
