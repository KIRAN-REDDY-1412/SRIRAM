const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

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
console.log(`Auditing ${files.length} files...`);

let issueCount = 0;

for (const filePath of files) {
  const code = fs.readFileSync(filePath, 'utf-8');
  try {
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx']
    });

    traverse(ast, {
      Identifier(astPath) {
        // Find references that are unbound in scope
        const name = astPath.node.name;
        if (
          astPath.isReferencedIdentifier() &&
          !astPath.scope.hasBinding(name) &&
          !global[name] &&
          !['window', 'document', 'console', 'React', 'Promise', 'Math', 'Date', 'JSON', 'Object', 'Array', 'Set', 'Map', 'String', 'Number', 'Boolean', 'RegExp', 'Error', 'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURIComponent', 'decodeURIComponent', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'window', 'localStorage', 'sessionStorage', 'alert', 'confirm', 'prompt', 'fetch', 'URL', 'FormData', 'Blob', 'File', 'FileReader', 'Image', 'Audio', 'navigator', 'location', 'history'].includes(name)
        ) {
          console.log(`[UNBOUND IDENTIFIER] ${path.relative(srcDir, filePath)} -> line ${astPath.node.loc?.start.line}: '${name}'`);
          issueCount++;
        }
      }
    });
  } catch (err) {
    // Parser error if any syntax issues
    console.error(`Parse error in ${path.relative(srcDir, filePath)}: ${err.message}`);
  }
}

console.log(`\nAudit finished. Found ${issueCount} potential unbound identifiers.`);
