const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const RES_DIR = path.join(__dirname, '../android-template/app/src/main/res');

const DENSITIES = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

function createPNG(size) {
  const width = size;
  const height = size;
  
  const rawData = Buffer.alloc(height * (width * 4 + 1));
  
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    rawData[rowStart] = 0;
    
    for (let x = 0; x < width; x++) {
      const px = rowStart + 1 + x * 4;
      const cx = x - width / 2;
      const cy = y - height / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      const maxDist = width / 2;
      
      let r = 99, g = 102, b = 241, a = 255;
      
      if (dist < maxDist * 0.85) {
        r = 120;
        g = 130;
        b = 250;
      }
      
      if (dist > maxDist * 0.92) {
        const fade = Math.min(1, (dist - maxDist * 0.92) / (maxDist * 0.08));
        a = Math.round(255 * (1 - fade));
      }
      
      const letterSize = size * 0.4;
      const lx = x - width / 2;
      const ly = y - height / 2 + letterSize * 0.1;
      
      if (Math.abs(ly) < letterSize * 0.1 && Math.abs(lx) < letterSize * 0.35) {
        r = 255; g = 255; b = 255;
      }
      
      if (lx > -letterSize * 0.35 && lx < -letterSize * 0.2 && ly > -letterSize * 0.4 && ly < letterSize * 0.4) {
        r = 255; g = 255; b = 255;
      }
      if (lx > letterSize * 0.2 && lx < letterSize * 0.35 && ly > -letterSize * 0.4 && ly < letterSize * 0.4) {
        r = 255; g = 255; b = 255;
      }
      if (lx > -letterSize * 0.15 && lx < letterSize * 0.15 && ly > letterSize * 0.2 && ly < letterSize * 0.4) {
        r = 255; g = 255; b = 255;
      }
      if (lx < 0 && lx > ly * 0.7 - letterSize * 0.1 && lx < ly * 0.7 + letterSize * 0.1 && ly > 0) {
        r = 255; g = 255; b = 255;
      }
      if (lx > 0 && lx > -ly * 0.7 - letterSize * 0.1 && lx < -ly * 0.7 + letterSize * 0.1 && ly > 0) {
        r = 255; g = 255; b = 255;
      }
      
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = a;
    }
  }
  
  const compressed = zlib.deflateSync(rawData);
  
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  
  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', compressed);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc = crc >>> 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

for (const [density, size] of Object.entries(DENSITIES)) {
  const dir = path.join(RES_DIR, density);
  
  const gitkeep = path.join(dir, '.gitkeep');
  if (fs.existsSync(gitkeep)) {
    fs.unlinkSync(gitkeep);
  }
  
  const png = createPNG(size);
  fs.writeFileSync(path.join(dir, 'ic_launcher.png'), png);
  fs.writeFileSync(path.join(dir, 'ic_launcher_round.png'), png);
  
  console.log(`Created icons for ${density} (${size}x${size})`);
}

const anydpiDir = path.join(RES_DIR, 'mipmap-anydpi-v26');

const icLauncherXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher"/>
</adaptive-icon>`;

const icLauncherRoundXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_round"/>
</adaptive-icon>`;

fs.writeFileSync(path.join(anydpiDir, 'ic_launcher.xml'), icLauncherXml);
fs.writeFileSync(path.join(anydpiDir, 'ic_launcher_round.xml'), icLauncherRoundXml);

const valuesDir = path.join(RES_DIR, 'values');
const colorsFilePath = path.join(valuesDir, 'colors.xml');

if (!fs.existsSync(colorsFilePath)) {
  const colorsXml = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#6366F1</color>
</resources>`;
  fs.writeFileSync(colorsFilePath, colorsXml);
  console.log('Created colors.xml with ic_launcher_background');
} else {
  let colorsContent = fs.readFileSync(colorsFilePath, 'utf8');
  if (!colorsContent.includes('ic_launcher_background')) {
    colorsContent = colorsContent.replace('</resources>', '    <color name="ic_launcher_background">#6366F1</color>\n</resources>');
    fs.writeFileSync(colorsFilePath, colorsContent);
    console.log('Updated colors.xml with ic_launcher_background');
  }
}

const anydpiGitkeep = path.join(anydpiDir, '.gitkeep');
if (fs.existsSync(anydpiGitkeep)) {
  fs.unlinkSync(anydpiGitkeep);
}

console.log('\nAll icons generated successfully!');
