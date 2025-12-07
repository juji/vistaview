import { onCleanup, onMount, type JSX } from 'solid-js';
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

type VistaViewProps = Omit<VistaViewOptions, 'elements'> & {
  children: JSX.Element;
  class?: string;
  selector: string;
  ref?: (el: HTMLDivElement) => void;
};

export function VistaView(props: VistaViewProps): JSX.Element {
  let container: HTMLDivElement | undefined;
  let instance: VistaViewInterface | null = null;

  onMount(() => {
    if (!container) return;
    if (!props.selector) throw new Error('VistaView: selector is required');
    const { children, class: _, selector, ref: __, ...options } = props;
    instance = vistaView({ ...options, elements: container.querySelectorAll(selector) });
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
