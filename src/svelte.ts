import { onDestroy } from 'svelte';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface } from './vistaview';
import type { VistaOpt } from './vistaview';

export function useVistaView(options: VistaParamsNeo): VistaInterface {
  let instance: VistaInterface | null = null;

  const getInstance = () => {
    if (!instance) {
      instance = vistaView(options);
    }
    return instance;
  };

  onDestroy(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    open: (i = 0) => getInstance()?.open(i),
    close: () => getInstance()?.close() ?? Promise.resolve(),
    reset: () => getInstance()?.reset(),
    next: () => getInstance()?.next(),
    prev: () => getInstance()?.prev(),
    zoomIn: () => getInstance()?.zoomIn(),
    zoomOut: () => getInstance()?.zoomOut(),
    getCurrentIndex: () => getInstance()?.getCurrentIndex() ?? -1,
    view: (i: number) => getInstance()?.view(i),
    destroy: () => {
      instance?.destroy();
      instance = null;
    },
  };
}

export interface VistaViewProps extends VistaOpt {
  id?: string;
  class?: string;
  selector?: string;
  ref?: VistaInterface;
}

export { default as VistaView } from './VistaView.svelte';
