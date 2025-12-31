import { onCleanup, onMount } from 'solid-js';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface, VistaOpt } from './vistaview';

export function useVistaView(options: VistaParamsNeo): VistaInterface {
  const instance = vistaView(options);

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

export interface VistaViewOptions extends VistaOpt {
  id?: string;
  selector?: string;
  ref?: (instance: VistaInterface) => void;
}

export function createVistaView(element: HTMLElement, options: VistaViewOptions) {
  const { selector = '> a', ref, ...vistaOptions } = options;
  const galleryId = options.id || `vvw-gallery-${Math.random().toString(36).slice(2)}`;
  element.id = galleryId;

  onMount(() => {
    const instance = vistaView({
      ...vistaOptions,
      elements: `#${galleryId} ${selector}`,
    });

    if (ref && instance) {
      ref(instance);
    }

    onCleanup(() => {
      instance?.destroy();
    });
  });
}
