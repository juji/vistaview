import { createVistaView } from 'vistaview/solid';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';
import { createSignal } from 'solid-js';

export default function SolidVistaViewDemo() {
  let vista: VistaInterface | undefined;
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div use:createVistaView={{ selector: '> a', ref: (v) => (vista = v) }}>
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
      <button style={{ marginTop: '16px' }} onClick={() => vista?.open(0)}>
        Open Gallery
      </button>
    </div>
  );
}
