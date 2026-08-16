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

const legacyNames = [
  'otherProblem',
  'problemDescription',
  'actionsTaken',
  'significanceLevel',
  'interventionOutcome',
  'outcomeComments',
  'responseDate',
  'responseTime',
  'replyMode',
  'questionCategory',
  'purposeOfEnquiry',
  'purposeOther',
  'suspectedDrugs',
  'concomitantDrugs'
];

console.log(`Auditing ${allSrcFiles.length} files in src/...`);
let totalIssues = 0;

allSrcFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  legacyNames.forEach(legacyName => {
    // Regex for standalone word matching
    const regex = new RegExp(`\\b${legacyName}\\b`, 'g');
    let match;
    while ((match = regex.exec(content)) !== null) {
      // Ignore string literals or comments if possible, but flag
      const lineNo = content.substring(0, match.index).split('\n').length;
      console.log(`⚠️ Potential issue in ${path.relative(srcDir, file)} L${lineNo}: found '${legacyName}'`);
      totalIssues++;
    }
  });
});

if (totalIssues === 0) {
  console.log('🎉 PERFECT! Zero legacy or undeclared variables found across all files in src/!');
} else {
  console.log(`Found ${totalIssues} potential issues.`);
}
