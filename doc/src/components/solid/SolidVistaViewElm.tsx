/** @jsxImportSource solid-js */

import { VistaView } from 'vistaview/solid';
import 'vistaview/style.css';
import './styles.css';

export default function SolidVistaViewElm() {
  return (
    <div class="hero-content-box">
      <VistaView selector="> a" class="image-grid vista-view">
        <a href="https://picsum.photos/seed/2222/1200/600" data-title="Image 1" class="img-1" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/2222/400/200" alt="Image 1" />
        </a>
        <a href="https://picsum.photos/seed/4444/800/800" data-title="Image 2" class="img-2" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/4444/200/200" alt="Image 2" />
        </a>
        <a href="https://picsum.photos/seed/6666/800/800" data-title="Image 3" class="img-3" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/6666/200/200" alt="Image 3" />
        </a>
        <a href="https://picsum.photos/seed/8888/1200/600" data-title="Image 4" class="img-4" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/8888/400/200" alt="Image 4" />
        </a>
      </VistaView>
    </div>
  );
}
