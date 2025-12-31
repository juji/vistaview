<script>
import { createVistaView } from 'vistaview/svelte';
import 'vistaview/style.css';
let vista;
const openGallery = () => {
  vista?.open(0);
};
</script>

<div use:createVistaView={{ selector: '> a', ref: vista }} class="svelte-vista-demo">
  <a href="https://picsum.photos/seed/2222/1200/600">
    <img src="https://picsum.photos/seed/2222/400/200" alt="Image 1" />
  </a>
  <a href="https://picsum.photos/seed/4444/800/800">
    <img src="https://picsum.photos/seed/4444/200/200" alt="Image 2" />
  </a>
  <a href="https://picsum.photos/seed/6666/800/800">
    <img src="https://picsum.photos/seed/6666/200/200" alt="Image 3" />
  </a>
  <a href="https://picsum.photos/seed/8888/1200/600">
    <img src="https://picsum.photos/seed/8888/400/200" alt="Image 4" />
  </a>
</div>
<button style="margin-top: 16px" on:click={openGallery}>Open Gallery</button>

<style>
.svelte-vista-demo {
  max-width: 600px;
  margin: 0 auto;
}
</style>
