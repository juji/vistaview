import { createEffect, onCleanup, onMount, splitProps } from 'solid-js';
import { vistaView } from 'vistaview';
import type { VistaOpt, VistaInterface } from 'vistaview';
import type { JSX } from 'solid-js';

export interface VistaViewProps extends JSX.HTMLAttributes<HTMLDivElement> {
  selector?: string;
  options?: VistaOpt;
  vistaRef?: (instance: VistaInterface | null) => void;
  ref?: (el: HTMLDivElement | undefined) => void;
  id?: string;
  children?: any;
}

export function VistaView(props: VistaViewProps) {
  let container: HTMLDivElement | undefined;
  let instance: VistaInterface | null = null;
  const [local, rest] = splitProps(props, ['selector', 'options', 'vistaRef', 'ref', 'id', 'children']);
  const galleryId = local.id || `vvw-gallery-${Math.random().toString(36).slice(2)}`;

  onMount(() => {
    if (!container) return;
    instance = vistaView({
      ...local.options,
      elements: `#${galleryId} ${local.selector ?? '> a'}`,
    });
    local.vistaRef?.(instance);
    local.ref?.(container);
  });

  createEffect(() => {
    // If options, selector, or children change, re-instantiate
    instance?.destroy();
    instance = vistaView({
      ...local.options,
      elements: `#${galleryId} ${local.selector ?? '> a'}`,
    });
    local.vistaRef?.(instance);
  });

  onCleanup(() => {
    instance?.destroy();
    local.vistaRef?.(null);
    instance = null;
  });

  return (
    <div ref={el => (container = el)} id={galleryId} {...rest}>
      {local.children}
    </div>
  );
}
