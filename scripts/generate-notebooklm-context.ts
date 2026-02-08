
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const OUTPUT_FILE_BASE = 'notebooklm-context';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const IGNORE_PATTERNS = [
  'node_modules/**',
  '.next/**',
  '.git/**',
  'dist/**',
  'build/**',
  'coverage/**',
  'ops/**',
  'public/**',
  '**/*.test.ts',
  '**/*.spec.ts',
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.svg',
  '**/*.ico',
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.mp4',
  '**/*.webm',
  '**/*.mp3',
  '**/*.wav',
  '**/*.pdf',
  '**/*.zip',
  '**/*.tar.gz',
  '**/*.tar',
  '**/*.gz',
  '**/*.7z',
  '**/*.rar',
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',
  '**/*.class',
  '**/*.jar',
  '**/*.war',
  '**/*.ear',
  '**/*.pyc',
  '.DS_Store',
  'notebooklm-context*.md'
];

const INCLUDED_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.css',
  '.scss',
  '.md',
  '.json',
  '.sql',
  '.prisma',
  '.drizzle'
];

async function generateContext() {
  console.log('Generating NotebookLM context files...');
  
  const rootDir = process.cwd();
  
  // Find all files
  const files = await glob('**/*.*', {
    ignore: IGNORE_PATTERNS,
    cwd: rootDir,
    nodir: true,
  });

  let currentPart = 1;
  let currentOutput = `# Project Codebase Context Part ${currentPart}\n\n`;
  currentOutput += `Generated on: ${new Date().toISOString()}\n\n`;

  let processedCount = 0;
  let skippedCount = 0;
  let totalWrittenBytes = 0;

  for (const file of files) {
    const ext = path.extname(file);
    if (!INCLUDED_EXTENSIONS.includes(ext)) {
      skippedCount++;
      continue;
    }

    // Skip generic large json files unless specific config
    if (ext === '.json' && !['package.json', 'tsconfig.json'].includes(path.basename(file))) {
        skippedCount++;
        continue;
    }

    try {
      const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
      const fileBlock = `## File: ${file}\n\n` + 
                        '```' + ext.slice(1) + '\n' + 
                        content + '\n' + 
                        '```\n\n';
      
      // Check if adding this block would exceed the limit
      if (Buffer.byteLength(currentOutput + fileBlock) > MAX_FILE_SIZE) {
        const fileName = `${OUTPUT_FILE_BASE}-part-${currentPart}.md`;
        fs.writeFileSync(fileName, currentOutput);
        console.log(`Generated ${fileName} (${(fs.statSync(fileName).size / 1024 / 1024).toFixed(2)} MB)`);
        totalWrittenBytes += fs.statSync(fileName).size;
        
        currentPart++;
        currentOutput = `# Project Codebase Context Part ${currentPart}\n\n`;
      }

      currentOutput += fileBlock;
      processedCount++;
    } catch (error) {
      console.error(`Error reading file ${file}:`, error);
    }
  }

  // Write the last part
  if (currentOutput.length > 0) {
    const fileName = `${OUTPUT_FILE_BASE}-part-${currentPart}.md`;
    fs.writeFileSync(fileName, currentOutput);
    console.log(`Generated ${fileName} (${(fs.statSync(fileName).size / 1024 / 1024).toFixed(2)} MB)`);
    totalWrittenBytes += fs.statSync(fileName).size;
  }
  
  console.log(`\nSuccessfully generated context files.`);
  console.log(`Processed: ${processedCount} files`);
  console.log(`Skipped: ${skippedCount} files`);
  console.log(`Total Size: ${(totalWrittenBytes / 1024 / 1024).toFixed(2)} MB`);
  console.log('\nYou can now upload the generated ".md" files to Google NotebookLM.');
}

generateContext().catch(console.error);
