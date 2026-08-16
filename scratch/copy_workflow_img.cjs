const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\tsrir\\.gemini\\antigravity\\brain\\21cc2b2e-4778-4e28-afb7-53c3aaa10ab2\\.user_uploaded\\media_1786889074860.png';
const destDir = path.join(__dirname, '..', 'public', 'workflows');
const destPath = path.join(destDir, 'workflow_full.png');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(srcPath, destPath);
console.log('Successfully copied workflow image to:', destPath);
