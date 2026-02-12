
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MEMORIES_DIR = path.resolve(__dirname, '../public/memories');

async function compressImages() {
  console.log('Starting image compression...');
  
  if (!fs.existsSync(MEMORIES_DIR)) {
    console.error(`Directory not found: ${MEMORIES_DIR}`);
    return;
  }

  const files = fs.readdirSync(MEMORIES_DIR).filter(file => /\.(jpg|jpeg|png)$/i.test(file));
  
  console.log(`Found ${files.length} images.`);

  for (const file of files) {
    const filePath = path.join(MEMORIES_DIR, file);
    const tempPath = path.join(MEMORIES_DIR, `temp-${file}`);
    
    try {
      const metadata = await sharp(filePath).metadata();
      const originalSize = fs.statSync(filePath).size;

      // 如果图片宽度大于 1600，或者体积大于 500KB，则压缩
      if ((metadata.width && metadata.width > 1600) || originalSize > 500 * 1024) {
        process.stdout.write(`Compressing ${file} (${(originalSize / 1024 / 1024).toFixed(2)} MB) ... `);
        
        await sharp(filePath)
          .resize(1600, null, { // 最大宽度 1600，高度自适应
            withoutEnlargement: true, // 如果原图更小，不放大
            fit: 'inside'
          })
          .jpeg({ 
            quality: 80, // 80% 质量
            mozjpeg: true // 使用 mozjpeg 算法获得更小体积
          })
          .toFile(tempPath);

        const newSize = fs.statSync(tempPath).size;
        
        // 覆盖原文件
        fs.unlinkSync(filePath);
        fs.renameSync(tempPath, filePath);
        
        console.log(`-> ${(newSize / 1024 / 1024).toFixed(2)} MB [Done]`);
      } else {
        console.log(`Skipping ${file} (Already optimized)`);
      }
    } catch (err) {
      console.error(`Error processing ${file}:`, err);
      // 清理临时文件
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  }

  console.log('All images processed!');
}

compressImages();
