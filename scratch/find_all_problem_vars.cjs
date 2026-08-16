const fs = require('fs');
const path = require('path');

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const srcDir = path.join(__dirname, '..', 'src');
const allSrcFiles = getAllFiles(srcDir);

console.log(`Checking ${allSrcFiles.length} files in src/...`);

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('otherProblem') || line.includes('other_problem') || line.includes('Problem')) {
      // Print matches that look like variable accesses
      if (line.includes('otherProblem')) {
        console.log(`MATCH in ${path.relative(srcDir, file)} L${index + 1}: ${line.trim()}`);
      }
    }
  });
});

console.log('Done checking!');
