import { onCleanup, onMount, type JSX } from 'solid-js';
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
    next: () => instance?.next(),
    prev: () => instance?.prev(),
    zoomIn: () => instance?.zoomIn(),
    zoomOut: () => instance?.zoomOut(),
    getCurrentIndex: () => instance?.getCurrentIndex() ?? -1,
    view: (i: number) => instance?.view(i),
    destroy: () => instance?.destroy(),
  };
}

type VistaViewProps = Omit<VistaOpt, 'elements'> & {
  children: JSX.Element;
  class?: string;
  selector: string;
  ref?: (el: HTMLDivElement) => void;
};

export function VistaView(props: VistaViewProps): JSX.Element {
  let container: HTMLDivElement | undefined;
  let instance: VistaInterface | null = null;

  onMount(() => {
    if (!container) return;
    if (!props.selector) throw new Error('VistaView: selector is required');
    const { children, class: _, selector, ref: __, ...options } = props;
    const containerId = `vvw-container-${Math.random().toString(36).substring(7)}`;
    container.id = containerId;
    const fullSelector = `#${containerId} ${selector}`;
    instance = vistaView({ ...options, elements: fullSelector });
  });

  onCleanup(() => {
    instance?.destroy();
    instance = null;
  });

  const setRef = (el: HTMLDivElement) => {
    container = el;
    props.ref?.(el);
  };

  // Return a function that creates the element (Solid's pattern without JSX)
  return (() => {
    const el = document.createElement('div');
    if (props.class) el.className = props.class;
    setRef(el);
    return el;
  }) as unknown as JSX.Element;
}
