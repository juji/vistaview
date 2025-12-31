<script lang="ts">
import { onMount } from 'svelte';
import { useVistaView } from './svelte';
import type { VistaViewProps } from './svelte';
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';

const { 
  children, 
  id, 
  selector = '> a', 
  ref,  
  divProps,
  ...rest
} = $props<
  VistaViewProps & 
  { children?: Snippet } & 
  { divProps: HTMLAttributes<HTMLDivElement> }
>();

let vista: ReturnType<typeof useVistaView>;

const initialId = `vvw-gallery-${Math.random().toString(36).slice(2)}`;

onMount(() => {
  const galleryId = id || initialId;

  // Initialize Vista with the computed galleryId and selector.
  vista = useVistaView({
    ...rest,
    elements: `#${galleryId} ${selector}`,
  });

  if (ref && vista) Object.assign(ref, vista);
});
</script>

<div {...divProps} id={id || initialId}>
  {@render children()}
</div>