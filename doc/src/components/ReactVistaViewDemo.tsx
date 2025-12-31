import { useRef } from 'react';
import { VistaView } from 'vistaview/react';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';

export default function ReactVistaViewDemo() {
  const vistaRef = useRef<VistaInterface>(null);
  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <VistaView ref={vistaRef} selector="> a">
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
      </VistaView>
      <button style={{marginTop: 16}} onClick={() => vistaRef.current?.open(0)}>
        Open Gallery
      </button>
    </div>
  );
}
