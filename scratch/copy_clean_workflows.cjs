const fs = require('fs');
const path = require('path');

const userUploadedDir = 'C:\\Users\\tsrir\\.gemini\\antigravity\\brain\\21cc2b2e-4778-4e28-afb7-53c3aaa10ab2\\.user_uploaded';
const destDir = path.join(__dirname, '..', 'public', 'workflows');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Map the 3 exact uploads to their role destination names
const mappings = [
  { src: 'media_1786896838617.png', dest: 'student_workflow.png', name: 'Student Workflow' },
  { src: 'media_1786896950134.png', dest: 'preceptor_workflow.png', name: 'Preceptor Workflow' },
  { src: 'media_1786896997532.png', dest: 'college_admin_workflow.png', name: 'College Admin Workflow' }
];

mappings.forEach(m => {
  const srcPath = path.join(userUploadedDir, m.src);
  const destPath = path.join(destDir, m.dest);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
    console.log(`Copied ${m.name} (${m.src}) -> ${destPath}`);
  } else {
    console.error(`ERROR: File not found: ${srcPath}`);
  }
});
