import { createEffect, onCleanup, onMount, splitProps } from 'solid-js';
import { vistaView } from 'vistaview';
import type { VistaOpt, VistaInterface } from 'vistaview';
import type { JSX } from 'solid-js';

export interface VistaViewProps extends JSX.HTMLAttributes<HTMLDivElement> {
  selector?: string;
  options?: VistaOpt;
  // callback to receive both API and container as an object { vistaView, container }
  componentRef?: (obj: { vistaView: VistaInterface | null; container?: HTMLDivElement | undefined } | null) => void;
  id?: string;
  children?: any;
}

export function VistaView(props: VistaViewProps) {
  let container: HTMLDivElement | undefined;
  let instance: VistaInterface | null = null;
  const [local, rest] = splitProps(props, ['selector', 'options', 'componentRef', 'id', 'children']);
  const galleryId = local.id || `vvw-gallery-${Math.random().toString(36).slice(2)}`;

  createEffect(() => {
    // Wait until the container is mounted before instantiating
    if (!container) return;

    // If options, selector, or children change, re-instantiate
    instance?.destroy();
    instance = vistaView({
      ...local.options,
      elements: `#${galleryId} ${local.selector ?? '> a'}`,
    });
    local.componentRef?.({ vistaView: instance, container });
  });

  onCleanup(() => {
    instance?.destroy();
    local.componentRef?.(null);
    instance = null;
  });

  return (
    <div ref={el => (container = el)} id={galleryId} {...rest}>
      {local.children}
    </div>
  );
}
