import { onDestroy } from 'svelte';
import { vistaView } from './vistaview';
import type { VistaParams, VistaInterface, VistaImg, VistaOpt } from './vistaview';

export type { VistaParams, VistaInterface, VistaImg, VistaOpt };

type UseVistaViewReturn = {
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export function useVistaView(options: VistaParams): UseVistaViewReturn {
  const instance = vistaView(options);

  onDestroy(() => {
    instance?.destroy();
  });

  return {
    open: (i = 0) => instance?.open(i),
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
  };
}
