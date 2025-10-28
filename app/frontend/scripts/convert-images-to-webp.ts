#!/usr/bin/env ts-node
/**
 * Script para convertir imágenes a formato webp
 */

import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

async function convertToWebp(inputPath: string, outputPath: string) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`✅ Converted: ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`❌ Error converting ${inputPath}:`, error);
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.log('Usage: npm run convert-webp <directory>');
    console.log('Example: npm run convert-webp public/images/providers/atacama-nightsky');
    process.exit(1);
  }

  const directory = args[0];

  if (!fs.existsSync(directory)) {
    console.error(`❌ Directory not found: ${directory}`);
    process.exit(1);
  }

  console.log(`🔄 Converting images in: ${directory}\n`);

  const files = fs.readdirSync(directory);
  const imageFiles = files.filter(f =>
    f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png')
  );

  if (imageFiles.length === 0) {
    console.log('No JPG/PNG images found to convert.');
    return;
  }

  for (const file of imageFiles) {
    const inputPath = path.join(directory, file);
    const outputPath = path.join(
      directory,
      file.replace(/\.(jpg|jpeg|png)$/i, '.webp')
    );

    await convertToWebp(inputPath, outputPath);
  }

  console.log(`\n✨ Conversion complete! Converted ${imageFiles.length} images.`);
  console.log('\n💡 You can now delete the original JPG/PNG files if desired.');
}

main();
