'use client';

import { useId, useRef, useState } from 'react';
import { VistaComponentRef, VistaView } from 'vistaview/react';
import 'vistaview/style.css';
import styles from './vistaview-demo.module.css';

const initialImages = [
  { full: "https://picsum.photos/id/1015/600/400", thumb: "https://picsum.photos/id/1015/300/200", alt: "Sample 1" },
  { full: "https://picsum.photos/id/1016/600/400", thumb: "https://picsum.photos/id/1016/300/200", alt: "Sample 2" },
  { full: "https://picsum.photos/id/1018/600/400", thumb: "https://picsum.photos/id/1018/300/200", alt: "Sample 3" },
  { full: "https://picsum.photos/id/1020/600/400", thumb: "https://picsum.photos/id/1020/300/200", alt: "Sample 4" },
  { full: "https://picsum.photos/id/1024/600/400", thumb: "https://picsum.photos/id/1024/300/200", alt: "Sample 5" },
  { full: "https://picsum.photos/id/1025/600/400", thumb: "https://picsum.photos/id/1025/300/200", alt: "Sample 6" },
];
const addition = [
  { full: "https://picsum.photos/id/0/600/400", thumb: "https://picsum.photos/id/0/300/200", alt: "Addition 1" },
  { full: "https://picsum.photos/id/1031/600/400", thumb: "https://picsum.photos/id/1031/300/200", alt: "Addition 2" },
  { full: "https://picsum.photos/id/1032/600/400", thumb: "https://picsum.photos/id/1032/300/200", alt: "Addition 3" },
  { full: "https://picsum.photos/id/1033/600/400", thumb: "https://picsum.photos/id/1033/300/200", alt: "Addition 4" },
  { full: "https://picsum.photos/id/1/600/400", thumb: "https://picsum.photos/id/1/300/200", alt: "Addition 5" },
  { full: "https://picsum.photos/id/1035/600/400", thumb: "https://picsum.photos/id/1035/300/200", alt: "Addition 6" },
];

export default function GalleryPage() {
  const [images, setImages] = useState(initialImages);
  const [added, setAdded] = useState(false);
  const ref = useRef<VistaComponentRef | null>(null);

  const handleToggle = () => {
    if (added) {
      setImages(initialImages);
      setAdded(false);
      ref.current?.vistaView?.reset();
    } else {
      setImages([...initialImages, ...addition]);
      setAdded(true);
      ref.current?.vistaView?.reset();
    }
  };

  return (
    <main style={{ padding: 32 }}>
      <h1>VistaView Next.js - Basic Example</h1>
      <button onClick={handleToggle} style={{ marginBottom: 24 }}>
        {added ? 'remove addition' : 'add image'}
      </button>
      <VistaView className={styles.vistaviewGrid} ref={ref}>
        {images.map((img, i) => (
          <a href={img.full} className={styles.vistaviewAnchor} key={img.full}>
            <img src={img.thumb} alt={img.alt} className={styles.vistaviewThumb} />
          </a>
        ))}
      </VistaView>
    </main>
  );
}
