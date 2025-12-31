/** @jsxImportSource solid-js */

import { onCleanup, onMount, createSignal } from 'solid-js';
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

export interface VistaViewProps {
  selector?: string;
  options?: VistaOpt;
  ref?: (instance: VistaInterface) => void;
}

export function VistaView(props: VistaViewProps & { children: any; id?: string; [key: string]: any }) {
  const [instance, setInstance] = createSignal<VistaInterface | null>(null);
  let containerRef: HTMLDivElement | undefined;

  const { selector = '> a', options, ref, id, children, ...rest } = props;
  const galleryId = id || `vvw-gallery-${Math.random().toString(36).substr(2, 9)}`;

  onMount(() => {
    if (!containerRef) return;

    const inst = vistaView({
      ...options,
      elements: `#${galleryId} ${selector}`,
    });

    if (inst) {
      setInstance(inst);
      ref?.(inst);
    }
  });

  onCleanup(() => {
    instance()?.destroy();
  });

  return (
    <div ref={el => containerRef = el} {...rest} id={galleryId}>
      {children}
    </div>
  );
}
