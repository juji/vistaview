<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { vistaView } from 'vistaview';
  import type { VistaOpt, VistaInterface } from 'vistaview';
  import { tick } from 'svelte';

  export let selector: string = '> a';
  export let options: VistaOpt = {} as VistaOpt;
  export let id: string = '';
  export let vistaRef: ((obj: { vistaView: VistaInterface | null; container: HTMLElement | null } | null) => void) | undefined = undefined;

  let container: HTMLDivElement | null = null;
  let instance: VistaInterface | null = null;
  const galleryId = id || `vvw-gallery-${Math.random().toString(36).slice(2)}`;

  function destroyInstance() {
    instance?.destroy();
    instance = null;
    vistaRef?.(null);
  }

  function initInstance() {
    if (!container) return;
    destroyInstance();
    instance = vistaView({
      ...options,
      elements: `#${galleryId} ${selector}`,
    });
    vistaRef?.({ vistaView: instance, container });
  }

  // expose API via component instance
  export function getApi() {
    return { vistaView: instance, container };
  }

  // re-init when props change
  $: selector, options, async () => {
    // wait DOM update if necessary
    await tick();
    initInstance();
  };

  let observer: MutationObserver | null = null;
  onMount(() => {
    initInstance();
    observer = new MutationObserver(() => {
      instance?.reset();
    });

    observer.observe(container!, {
      childList: true,
      subtree: false,
    });
  });

  onDestroy(() => {
    observer?.disconnect();
    destroyInstance();
  });
</script>

<div id={galleryId} bind:this={container} {...$$restProps}>
  <slot />
</div>
