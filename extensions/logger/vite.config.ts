import { defineConfig } from 'vite';
import { resolve } from 'path';

// Add src/style.css as entry;

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      name: 'logger',
      entry: {
        ['logger']: resolve(__dirname, 'src/main.ts'),
      },
      formats: ['es', 'umd'],
    }
  },
});
