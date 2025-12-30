#!/usr/bin/env node

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'dev', 'images');
const outputDir = path.join(inputDir, 'thumbnails');

// Create thumbnails directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

console.log('Creating thumbnails...');

// Read all files from input directory
fs.readdir(inputDir, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter for image files
  const imageFiles = files.filter(
    (file) => /\.(jpg|jpeg|png|gif|webp)$/i.test(file) && !file.includes('thumbnail') // Skip existing thumbnails
  );

  console.log(`Found ${imageFiles.length} images to process`);

  let processed = 0;
  const total = imageFiles.length;

  imageFiles.forEach((file) => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `thumb_${file}`);

    sharp(inputPath)
      .resize(300, null, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath)
      .then(() => {
        processed++;
        console.log(`✓ Created thumbnail: ${outputPath}`);
        if (processed === total) {
          console.log(`\nCompleted! Created ${total} thumbnails in ${outputDir}`);
        }
      })
      .catch((err) => {
        console.error(`✗ Error processing ${file}:`, err.message);
        processed++;
        if (processed === total) {
          console.log(`\nCompleted with some errors. Created thumbnails in ${outputDir}`);
        }
      });
  });
});
