

import { defineConfig } from 'vite';
import { resolve } from 'path';

// Add src/style.css as entry;

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      name: 'main',
      entry: {
        ['main']: resolve(__dirname, 'src/main.ts'),
      },
      formats: ['es', 'umd'],
    },
    rollupOptions: {
      external: ['vistaview'],
      output: {
        globals: {
          vistaview: 'VistaView',
        },
      },
    },
    sourcemap: true,
  },
});
