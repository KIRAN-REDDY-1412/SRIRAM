const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', '..', 'src');

function getAllJsxFiles(dir, files = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllJsxFiles(fullPath, files);
    } else if (entry.name.endsWith('.jsx') || entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }
  return files;
}

const files = getAllJsxFiles(srcDir);
console.log(`Scanning ${files.length} files for useMemo / useEffect variable references...`);

for (const filePath of files) {
  const code = fs.readFileSync(filePath, 'utf-8');
  const lines = code.split('\n');

  // Find all state declarations: const [varName, setVarName]
  const declaredVars = new Set();
  const stateRegex = /const\s+\[\s*([a-zA-Z0-9_$]+)\s*,\s*set[a-zA-Z0-9_$]+\s*\]/g;
  let match;
  while ((match = stateRegex.exec(code)) !== null) {
    declaredVars.add(match[1]);
  }

  // Find const/let declarations
  const constRegex = /(?:const|let|var)\s+\{?\s*([a-zA-Z0-9_$,\s\n:]+)\s*\}?\s*=/g;
  while ((match = constRegex.exec(code)) !== null) {
    const rawNames = match[1].split(/[\s,{}]+/);
    for (const name of rawNames) {
      if (name && /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
        declaredVars.add(name);
      }
    }
  }

  // Find function parameters
  const paramRegex = /(?:function\s+[a-zA-Z0-9_$]*|\([a-zA-Z0-9_$,\s={}:]*\)|=>)\s*\{/g;
  
  // Specifically scan useMemo dependency arrays and object property shorthand/values
  lines.forEach((line, idx) => {
    // Check useMemo / useEffect dependency arrays
    if (line.includes('useMemo') || line.includes('useEffect') || line.includes('computeModuleDiffs') || line.includes('currentInterventionObj') || line.includes('currentDirObj') || line.includes('currentAdrObj')) {
      // Find all identifiers in this line or nearby lines
    }
  });
}

console.log('Done scanning.');
