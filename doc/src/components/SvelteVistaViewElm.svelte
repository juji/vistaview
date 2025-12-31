<script>
import { VistaView } from 'vistaview/svelte';
import 'vistaview/style.css';
</script>

<div class="hero-content-box">
  <VistaView selector="> a" class="image-grid vista-view">
    <a href="https://picsum.photos/seed/2222/1200/600" data-title="Image 1" class="img-1" target="_blank" rel="noopener">
      <img src="https://picsum.photos/seed/2222/400/200" alt="Serene landscape with rolling hills under a soft cloudy sky, gentle sunlight creating a peaceful atmosphere, no visible text" />
    </a>
    <a href="https://picsum.photos/seed/4444/800/800" data-title="Image 2" class="img-2" target="_blank" rel="noopener">
      <img src="https://picsum.photos/seed/4444/200/200" alt="Dense forest with tall trees and dappled sunlight filtering through leaves, tranquil and inviting, no visible text" />
    </a>
    <a href="https://picsum.photos/seed/6666/800/800" data-title="Image 3" class="img-3" target="_blank" rel="noopener">
      <img src="https://picsum.photos/seed/6666/200/200" alt="Mountain range with rugged peaks and misty valleys, dramatic and awe inspiring, no visible text" />
    </a>
    <a href="https://picsum.photos/seed/8888/1200/600" data-title="Image 4" class="img-4" target="_blank" rel="noopener">
      <img src="https://picsum.photos/seed/8888/400/200" alt="Calm lake reflecting surrounding trees and sky, tranquil setting with soft light, no visible text" />
    </a>
  </VistaView>
</div>

<style>
  .hero-content-box {
    border-radius: 0.5rem;
    max-width: 800px;
    min-width: 400px;
    margin: 0 auto;
  }
  :global(.image-grid) {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    gap: 0.5rem;
  }
  :global(.image-grid a) {
    display: block;
    cursor: pointer;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  :global(.image-grid img) {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 0.25rem;
    display: block;
  }
  .img-1 {
    grid-column: 1 / 3;
    grid-row: 1;
  }
  .img-2 {
    grid-column: 3;
    grid-row: 1;
  }
  .img-3 {
    grid-column: 1;
    grid-row: 2;
  }
  .img-4 {
    grid-column: 2 / 4;
    grid-row: 2;
  }
</style>
