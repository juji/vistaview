import { onCleanup } from 'solid-js';
import { vistaView } from './vistaview';
import type { VistaViewOptions, VistaViewInterface, VistaViewImage } from './vistaview';

export type { VistaViewOptions, VistaViewInterface, VistaViewImage };

type UseVistaViewOptions = Omit<VistaViewOptions, 'parent'>;

type UseVistaViewReturn = {
  init: (container: HTMLElement) => void;
  open: (startIndex?: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  getCurrentIndex: () => number;
  view: (index: number) => void;
};

export function useVistaView(options: UseVistaViewOptions = {}): UseVistaViewReturn {
  let instance: VistaViewInterface | null = null;

  onCleanup(() => {
    instance?.destroy();
    instance = null;
  });

  return {
    init: (container: HTMLElement) => {
      instance = vistaView({ parent: container, ...options });
    },
    open: (i = 0) => instance?.open(i),
    close: () => instance?.close(),
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
  };
}
