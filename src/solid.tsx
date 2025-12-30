/** @jsxImportSource solid-js */
import { onCleanup, onMount, mergeProps, splitProps, type JSX } from 'solid-js';
import { vistaView } from './vistaview';
import type { VistaParamsNeo, VistaInterface } from './vistaview';

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

export interface VistaViewProps extends VistaParamsNeo {
  children: JSX.Element;
  class?: string;
  id?: string;
  selector?: '> a' | '> img';
  ref?: (instance: VistaInterface) => void;
}

export function VistaView(props: VistaViewProps): JSX.Element {
  const merged = mergeProps({ selector: '> a' as const }, props);
  const [local, options] = splitProps(merged, ['children', 'class', 'id', 'selector', 'ref']);
  
  let containerRef!: HTMLDivElement;
  let instance: VistaInterface | null = null;
  const galleryId = local.id || `vvw-gallery-${Math.random().toString(36).substr(2, 9)}`;

  onMount(() => {
    if (!containerRef) return;

    instance = vistaView({
      ...options,
      elements: options.elements || `#${galleryId} ${local.selector}`,
    });

    if (local.ref && instance) {
      local.ref(instance);
    }
  });

  onCleanup(() => {
    instance?.destroy();
    instance = null;
  });

  return (
    <div ref={containerRef} id={galleryId} class={local.class}>
      {local.children}
    </div>
  );
}
