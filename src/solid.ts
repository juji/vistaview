import { onCleanup } from 'solid-js';
import { vistaView } from './vistaview';
import type { VistaViewOptions, VistaViewInterface, VistaViewImage } from './vistaview';

export type { VistaViewOptions, VistaViewInterface, VistaViewImage };

type UseVistaViewReturn = {
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export function useVistaView(options: VistaViewOptions): UseVistaViewReturn {
  const instance = vistaView(options);

  onCleanup(() => {
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
