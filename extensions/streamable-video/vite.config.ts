import { defineConfig } from 'vite';
import { resolve } from 'path';

// Add src/style.css as entry;

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      name: 'streamable-video',
      entry: {
        ['streamable-video']: resolve(__dirname, 'src/main.ts'),
      },
      formats: ['es', 'umd'],
    }
  },
});
