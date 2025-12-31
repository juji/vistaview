import { useRef } from 'react';
import { VistaView } from 'vistaview/react';
import type { VistaInterface } from 'vistaview';
import 'vistaview/style.css';
import './styles.css';

export default function ReactVistaViewElm() {
  const vistaRef = useRef<VistaInterface>(null);
  return (
    <div className="hero-content-box">
      <VistaView ref={vistaRef} selector="> a" className="image-grid vista-view">
        <a href="https://picsum.photos/seed/2222/1200/600" data-title="Image 1" className="img-1" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/2222/400/200" alt="Image 1" />
        </a>
        <a href="https://picsum.photos/seed/4444/800/800" data-title="Image 2" className="img-2" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/4444/200/200" alt="Image 2" />
        </a>
        <a href="https://picsum.photos/seed/6666/800/800" data-title="Image 3" className="img-3" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/6666/200/200" alt="Image 3" />
        </a>
        <a href="https://picsum.photos/seed/8888/1200/600" data-title="Image 4" className="img-4" target="_blank" rel="noopener">
          <img src="https://picsum.photos/seed/8888/400/200" alt="Image 4" />
        </a>
      </VistaView>
    </div>
  );
}
