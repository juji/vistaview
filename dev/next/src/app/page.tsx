

import { VistaView } from 'vistaview/react';
import 'vistaview/style.css';
import styles from './vistaview-demo.module.css';


export default function GalleryPage() {
  return (
    <main style={{ padding: 32 }}>
      <h1>VistaView Next.js - Basic Example</h1>
      <VistaView className={styles.vistaviewGrid}>
        <a href="https://picsum.photos/id/1015/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1015/300/200" alt="Sample 1" className={styles.vistaviewThumb} />
        </a>
        <a href="https://picsum.photos/id/1016/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1016/300/200" alt="Sample 2" className={styles.vistaviewThumb} />
        </a>
        <a href="https://picsum.photos/id/1018/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1018/300/200" alt="Sample 3" className={styles.vistaviewThumb} />
        </a>
        <a href="https://picsum.photos/id/1020/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1020/300/200" alt="Sample 4" className={styles.vistaviewThumb} />
        </a>
        <a href="https://picsum.photos/id/1024/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1024/300/200" alt="Sample 5" className={styles.vistaviewThumb} />
        </a>
        <a href="https://picsum.photos/id/1025/600/400" className={styles.vistaviewAnchor}>
          <img src="https://picsum.photos/id/1025/300/200" alt="Sample 6" className={styles.vistaviewThumb} />
        </a>
      </VistaView>
    </main>
  );
}
