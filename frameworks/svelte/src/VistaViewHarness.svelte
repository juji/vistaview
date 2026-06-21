<script lang="ts">
  import VistaView from './lib/VistaView.svelte'
  import type { VistaOpt } from 'vistaview'

  export let id: string = ''
  export let selector: string = '> a'
  export let options: VistaOpt = {} as VistaOpt
  export let vistaRef: ((obj: any) => void) | undefined = undefined
</script>

<VistaView {id} {selector} {options} {vistaRef}>
  <a href="p1.jpg"><img src="t1.jpg" alt="1" /></a>
  <a href="p2.jpg"><img src="t2.jpg" alt="2" /></a>
</VistaView>
