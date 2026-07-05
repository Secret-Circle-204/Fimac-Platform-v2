const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
const MAX_WIDTH = 1920; // Max width for any image
const QUALITY = 80; // JPEG quality (80 is excellent for web)

async function compressImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const stats = fs.statSync(filePath);
  const sizeMB = stats.size / (1024 * 1024);
  
  // Only compress files larger than 1MB
  if (sizeMB < 1) {
    console.log(`  SKIP ${path.basename(filePath)} (${sizeMB.toFixed(2)} MB - already small)`);
    return;
  }

  const originalSize = stats.size;
  const tempPath = filePath + '.tmp';

  try {
    const metadata = await sharp(filePath).metadata();
    const needsResize = metadata.width > MAX_WIDTH;

    let pipeline = sharp(filePath);
    
    if (needsResize) {
      pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
    }

    if (ext === '.png') {
      pipeline = pipeline.png({ quality: QUALITY, compressionLevel: 9 });
    } else {
      pipeline = pipeline.jpeg({ quality: QUALITY, mozjpeg: true });
    }

    await pipeline.toFile(tempPath);

    const newStats = fs.statSync(tempPath);
    const newSizeMB = newStats.size / (1024 * 1024);
    const reduction = ((1 - newStats.size / originalSize) * 100).toFixed(1);

    // Replace original with compressed
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    console.log(`  ✓ ${path.basename(filePath)}: ${sizeMB.toFixed(2)} MB → ${newSizeMB.toFixed(2)} MB (${reduction}% smaller)`);
  } catch (err) {
    console.error(`  ✗ Error compressing ${path.basename(filePath)}: ${err.message}`);
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
}

async function walkDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath);
    } else {
      await compressImage(fullPath);
    }
  }
}

async function main() {
  console.log('🔧 Compressing images in /public ...');
  console.log(`   Max width: ${MAX_WIDTH}px, Quality: ${QUALITY}%\n`);
  await walkDir(PUBLIC_DIR);
  console.log('\n✅ Done! All images compressed.');
}

main();
