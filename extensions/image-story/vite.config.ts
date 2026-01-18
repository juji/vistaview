import { defineConfig } from 'vite';
import { resolve } from 'path';

// Add src/style.css as entry;

let entry = {
  ['image-story']: resolve(__dirname, 'src/main.ts'),
  style: resolve(__dirname, 'src/style.css'),
};

const isUMD = process.env.UMD === '1'

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: !!isUMD,
    lib: {
      name: 'image-story',
      entry: isUMD ? {
        ['image-story']: resolve(__dirname, 'src/main.ts'),
      } : entry,
      formats: isUMD ? ['umd'] : ['es'],
    },
    cssCodeSplit: !isUMD,
  },
});
