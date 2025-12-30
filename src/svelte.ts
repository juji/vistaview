import { onDestroy, onMount } from 'svelte';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface } from './vistaview';

export function useVistaView(options: VistaParamsNeo): VistaInterface {
  const instance = vistaView(options);

  onDestroy(() => {
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

export interface VistaViewProps extends VistaParamsNeo {
  id?: string;
  class?: string;
  selector?: string;
  ref?: VistaInterface;
}

export function createVistaView(node: HTMLElement, params: VistaViewProps) {
  let instance: VistaInterface | null = null;
  const { selector = '> a', ref, ...options } = params;
  const galleryId =
    params.id || node.id || `vvw-gallery-${Math.random().toString(36).substr(2, 9)}`;

  if (!node.id) {
    node.id = galleryId;
  }

  function init() {
    instance = vistaView({
      ...options,
      elements: options.elements || `#${galleryId} ${selector}`,
    });

    if (ref && instance) {
      Object.assign(ref, instance);
    }
  }

  onMount(() => {
    init();
  });

  return {
    destroy() {
      instance?.destroy();
      instance = null;
    },
  };
}
