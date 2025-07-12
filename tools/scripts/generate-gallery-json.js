const fs = require('fs');
const path = require('path');

const GALLERY_ROOT = path.join(__dirname, '../public/images/gallery');
const OUTPUT = path.join(__dirname, '../gallery-images.json');

function walkDir(dir) {
  return fs.readdirSync(dir).filter(f => !f.startsWith('.'));
}

function isImage(file) {
  return /\.(jpg|jpeg|png|webp)$/i.test(file);
}

function getRelativePublicPath(absPath) {
  return absPath.split('/public')[1].replace(/\\/g, '/');
}

function collectGalleryImages() {
  const folders = walkDir(GALLERY_ROOT);
  const images = [];

  folders.forEach(folder => {
    const folderPath = path.join(GALLERY_ROOT, folder);
    const stat = fs.statSync(folderPath);
    if (!stat.isDirectory()) return;

    const subdirs = walkDir(folderPath);
    // 썸네일/원본 구조
    if (subdirs.includes('thumbnails') && subdirs.includes('originals')) {
      const thumbs = walkDir(path.join(folderPath, 'thumbnails')).filter(isImage);
      thumbs.forEach(name => {
        const thumbPath = path.join(folderPath, 'thumbnails', name);
        const origPath = path.join(folderPath, 'originals', name);
        if (fs.existsSync(origPath)) {
          images.push({
            name,
            thumbnail: getRelativePublicPath(thumbPath),
            original: getRelativePublicPath(origPath),
          });
        }
      });
    } else {
      // 단일 이미지 폴더 (썸네일 없음)
      walkDir(folderPath).forEach(file => {
        const abs = path.join(folderPath, file);
        if (isImage(file) && fs.statSync(abs).isFile()) {
          images.push({
            name: file,
            thumbnail: getRelativePublicPath(abs),
            original: getRelativePublicPath(abs),
          });
        }
      });
    }
  });
  return images;
}

const images = collectGalleryImages();
fs.writeFileSync(OUTPUT, JSON.stringify(images, null, 2)); 