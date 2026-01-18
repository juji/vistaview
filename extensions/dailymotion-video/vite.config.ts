

import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Collect all CSS files from src/styles
const stylesDir = resolve(__dirname, 'src/styles');
const styleFiles = readdirSync(stylesDir)
  .filter((file) => file.endsWith('.css'))
  .reduce((acc, file) => {
    const name = file.replace('.css', '');
    acc[`styles/${name}` as string] = resolve(stylesDir, file);
    return acc;
  }, {} as Record<string, string>);

// Add src/style.css as entry
let entry = {
  vistaview: resolve(__dirname, 'src/vistaview.ts'),
  style: resolve(__dirname, 'src/style.css'),
  ...styleFiles
};

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        exports: 'named',
        assetFileNames: (assetInfo) => {
          if (assetInfo.names[0] && assetInfo.names[0].endsWith('.css')) {
            return assetInfo.names[0] === 'style.css' ?  '[name][extname]' : 'styles/[name][extname]';
          }
          return '[name][extname]';
        },
      },
    },
    minify: 'esbuild',
    cssCodeSplit: true,
  },
});
