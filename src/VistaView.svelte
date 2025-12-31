<script lang="ts">
import { onMount } from 'svelte';
import { useVistaView } from './svelte';
import type { VistaViewProps } from './svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { VistaOpt } from './vistaview';

export let id: string | undefined = undefined;
export let selector: string = '> a';
export let ref: any = undefined;
export let options: VistaOpt = {};

let vista: ReturnType<typeof useVistaView>;
let element: HTMLDivElement;

const initialId = `vvw-gallery-${Math.random().toString(36).slice(2)}`;

onMount(() => {
  const galleryId = id || initialId;

  // Initialize Vista with the computed galleryId and selector.
  vista = useVistaView({
    ...options,
    elements: `#${galleryId} ${selector}`,
  });

  if (ref && vista) Object.assign(ref, vista);
});
</script>

<div bind:this={element} {...$$restProps} id={id || initialId}>
  <slot />
</div>