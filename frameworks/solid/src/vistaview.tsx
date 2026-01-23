import { onCleanup, onMount, splitProps } from 'solid-js';
import { children, createEffect } from "solid-js";
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
  // galleryId will be read from the container's id attribute after mount
  let galleryId = local.id || `vvw-gallery-${Math.random().toString(36).slice(2)}`;

  const resolved = children(() => props.children);
  createEffect(() => {
    const nodes = resolved();
    if(nodes && instance) {
      instance.reset();
    }
  });

  onMount(() => {
    if (!container) {
      console.warn('VistaView: container not yet mounted');
      return;
    }
    // Get the id from the actual DOM node
    const realId = container.id;
    const selector = `#${realId} ${local.selector ?? '> a'}`;
    const nodes = document.querySelectorAll(selector);
    if (nodes.length > 0) {
      instance?.destroy();
      instance = vistaView({
        ...local.options,
        elements: selector,
      });
      local.componentRef?.({ vistaView: instance, container });
    }
  });

  onCleanup(() => {
    instance?.destroy();
    local.componentRef?.(null);
    instance = null;
  });

  return (
    <div ref={el => (container = el)} {...rest} id={galleryId}>
      {local.children}
    </div>
  );
}
