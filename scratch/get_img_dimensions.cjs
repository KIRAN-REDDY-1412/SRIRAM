const fs = require('fs');

function getPngDimensions(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.toString('hex', 0, 8) !== '89504e470d0a1a0a') {
    throw new Error('Not a PNG file');
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

const srcPath = 'C:\\Users\\tsrir\\.gemini\\antigravity\\brain\\21cc2b2e-4778-4e28-afb7-53c3aaa10ab2\\.user_uploaded\\media_1786889074860.png';
console.log('PNG Dimensions:', getPngDimensions(srcPath));
