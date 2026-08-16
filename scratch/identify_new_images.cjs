const fs = require('fs');
const path = require('path');

const userUploadedDir = 'C:\\Users\\tsrir\\.gemini\\antigravity\\brain\\21cc2b2e-4778-4e28-afb7-53c3aaa10ab2\\.user_uploaded';

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') return null;
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const files = fs.readdirSync(userUploadedDir)
  .filter(f => f.endsWith('.png'))
  .map(f => {
    const fullPath = path.join(userUploadedDir, f);
    const stat = fs.statSync(fullPath);
    const dim = getPngDimensions(fullPath);
    return { name: f, time: stat.mtimeMs, size: stat.size, dim, path: fullPath };
  })
  .sort((a, b) => b.time - a.time);

console.log('Most recent PNG uploads:');
files.slice(0, 8).forEach(f => {
  console.log(`${f.name} | ${new Date(f.time).toISOString()} | ${f.dim?.width}x${f.dim?.height} | ${f.size} bytes`);
});
