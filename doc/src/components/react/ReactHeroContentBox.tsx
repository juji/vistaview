import React, { useEffect } from 'react';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';
import './ReactHeroContentBox.css';

export default function ReactHeroContentBox() {
  useEffect(() => {
    vistaView({ elements: '#react-image-grid a' });
  }, []);
  return (
    <div className="hero-content-box">
      <div id="react-image-grid" className="image-grid vista-view">
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
      </div>
    </div>
  );
}
