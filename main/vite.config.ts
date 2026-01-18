import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';

// Collect all CSS files in src/styles
const stylesDir = path.resolve(__dirname, 'src/styles');
const styleFiles = fs.readdirSync(stylesDir)
  .filter(f => f.endsWith('.css'))
  .map(f => path.join(stylesDir, f));


export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: false,
    cssCodeSplit: false,
    rollupOptions: {
      input: path.resolve(__dirname, 'src/vistaview.ts'),
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name][extname]'
      },
      external: [],
    }
  },
  plugins: [
    {
      name: 'copy-styles',
      closeBundle() {
        const destDir = path.resolve(__dirname, 'dist/styles');
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        for (const file of styleFiles) {
          const dest = path.join(destDir, path.basename(file));
          fs.copyFileSync(file, dest);
        }
      }
    }
  ]
});
