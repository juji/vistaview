import React, { useEffect } from 'react';
import { vistaView } from 'vistaview';
import 'vistaview/style.css';

export default function ReactHeroContentBox() {
  useEffect(() => {
    vistaView({ elements: '#react-image-grid a' });
  }, []);
  return (
    <>
      <style>{`
        .hero-content-box {
          border-radius: 0.5rem;
          max-width: 800px;
          min-width: 400px;
          margin: 0 auto;
        }
        .image-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 1fr);
          gap: 0.5rem;
        }
        .image-grid a {
          display: block;
          cursor: pointer;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        .image-grid img {
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
      `}</style>
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
    </>
  );
}
