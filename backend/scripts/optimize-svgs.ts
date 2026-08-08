import fs from 'fs';
import path from 'path';
import { optimize } from 'svgo';
import { env } from '../src/config/env';

const uploadDir = path.resolve(env.UPLOAD_DIR);

function optimizeSvgs() {
  if (!fs.existsSync(uploadDir)) {
    console.log('Upload directory does not exist.');
    return;
  }

  const files = fs.readdirSync(uploadDir);
  let optimizedCount = 0;
  let savedBytes = 0;

  for (const file of files) {
    if (file.toLowerCase().endsWith('.svg')) {
      const filePath = path.join(uploadDir, file);
      try {
        const statBefore = fs.statSync(filePath);
        const svgData = fs.readFileSync(filePath, 'utf8');
        
        const result = optimize(svgData, {
          path: filePath,
          multipass: true,
        });

        if (result.data) {
          fs.writeFileSync(filePath, result.data);
          const statAfter = fs.statSync(filePath);
          
          if (statAfter.size < statBefore.size) {
            const saved = statBefore.size - statAfter.size;
            savedBytes += saved;
            console.log(`Optimized ${file}: Saved ${(saved / 1024).toFixed(2)} KB`);
          }
          optimizedCount++;
        }
      } catch (err) {
        console.error(`Failed to optimize ${file}:`, err);
      }
    }
  }

  console.log(`\nDone! Optimized ${optimizedCount} SVG files.`);
  console.log(`Total space saved: ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
}

optimizeSvgs();
