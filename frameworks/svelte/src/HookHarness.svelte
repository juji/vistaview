<script lang="ts">
  import { useVistaView } from './lib/use-vistaview'
  import type { VistaInterface, VistaParams } from 'vistaview'

  export let options: VistaParams
  export let onReady: (api: VistaInterface) => void

  $: {
    onReady(useVistaView(options))
  }
</script>
