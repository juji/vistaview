

import { createEffect, onCleanup } from 'solid-js';
import { vistaView } from './vistaview';
import type { VistaParams, VistaInterface } from './vistaview';

export function useVistaView(options: VistaParams): VistaInterface {
  let instance: VistaInterface | null = null;

  createEffect(() => {
    instance?.destroy();
    instance = vistaView(options);
  });

  onCleanup(() => {
    instance?.destroy();
  });

  return {
    open: (i = 0) => instance?.open(i),
    close: () => instance?.close() ?? Promise.resolve(),
    reset: () => instance?.reset(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    zoomIn: () => instance?.zoomIn(),
    zoomOut: () => instance?.zoomOut(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
    destroy: () => instance?.destroy(),
  };
}
