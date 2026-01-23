'use client';

import { useRef } from 'react';
import { useVistaView } from 'vistaview/react';
import 'vistaview/style.css';
import styles from './vistaview-demo.module.css';

const images = [
  { full: "https://picsum.photos/id/1015/600/400", thumb: "https://picsum.photos/id/1015/300/200", alt: "Sample 1" },
  { full: "https://picsum.photos/id/1016/600/400", thumb: "https://picsum.photos/id/1016/300/200", alt: "Sample 2" },
  { full: "https://picsum.photos/id/1018/600/400", thumb: "https://picsum.photos/id/1018/300/200", alt: "Sample 3" },
  { full: "https://picsum.photos/id/1020/600/400", thumb: "https://picsum.photos/id/1020/300/200", alt: "Sample 4" },
  { full: "https://picsum.photos/id/1024/600/400", thumb: "https://picsum.photos/id/1024/300/200", alt: "Sample 5" },
  { full: "https://picsum.photos/id/1025/600/400", thumb: "https://picsum.photos/id/1025/300/200", alt: "Sample 6" },
];

export default function VistaViewHookDemo() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useVistaView({
    elements: '#vistaview-hook-demo > a',
  });

  return (
    <main style={{ padding: 32 }}>
      <h1>VistaView Next.js - useVistaView Hook Demo</h1>
      <div id="vistaview-hook-demo" ref={containerRef} className={styles.vistaviewGrid}>
        {images.map((img, i) => (
          <a href={img.full} className={styles.vistaviewAnchor} key={img.full}>
            <img src={img.thumb} alt={img.alt} className={styles.vistaviewThumb} />
          </a>
        ))}
      </div>
    </main>
  );
}
